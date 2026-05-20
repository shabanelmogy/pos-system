import { Request, Response } from "express";
import orderService from "./order.service.js";
import { handleError, fail } from "../../../utils/errorHandler.js";
import { z } from "zod";
import { 
  createOrderSchema, 
  updateFulfillmentStatusSchema, 
  updateLifecycleSchema,
  orderItemSchema,
  updateItemQuantitySchema,
  voidItemSchema,
  moveTableSchema,
  mergeOrdersSchema,
  splitOrderSchema,
  applyCouponSchema,
  addPaymentSchema,
  refundOrderSchema
} from "./order.validation.js"; 

export const orderController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        pageSize = 20, 
        lifecycle, 
        fulfillmentStatus, 
        paymentStatus, 
        type, 
        tableId, 
        shiftId, 
        customerId,
        includeItems
      } = req.query as any;

      const user = (req as any).user;
      const filters = {
        page: Number(page),
        pageSize: Number(pageSize),
        lifecycle,
        fulfillmentStatus,
        paymentStatus,
        type,
        tableId,
        shiftId,
        customerId,
        includeItems: includeItems === 'true',
        branchId: (() => {
          if (user.role !== "admin") return user.branchId;
          const raw = req.query.branchId as string;
          if (raw !== undefined && !z.string().uuid().safeParse(raw).success) fail("branchId must be a valid UUID", 400);
          return raw;
        })()
      };
      
      const result = await orderService.getAllOrders(filters);
      res.status(200).json({ 
        success: true, 
        data: result.orders,
        pagination: result.pagination,
        slim: result.slim
      });
    } catch (error) {
      handleError(res, error, "orderController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const context = {
        role: user.role,
        branchId: user.branchId
      };
      const order = await orderService.getOrderById(id, context);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      handleError(res, error, "orderController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const user = (req as any).user;
      
      const context = {
        branchId: user.branchId,
        userId: user.id,
        shiftId: user.activeShiftId,
        posPointId: user.activePosPointId,
      };

      const newOrder = await orderService.createOrder(validatedData, context);
      res.status(201).json({ success: true, message: req.t("order.created"), data: newOrder });
    } catch (error) {
      handleError(res, error, "orderController.create");
    }
  },

  async confirmDraft(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.confirmDraft(id, context);
      res.status(200).json({ success: true, message: req.t("order.draft_confirmed"), data: result });
    } catch (error) {
      handleError(res, error, "orderController.confirmDraft");
    }
  },

  async updateFulfillment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes, reasonCode } = updateFulfillmentStatusSchema.parse(req.body);
      const user = (req as any).user;
      
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };

      const result = await orderService.updateFulfillmentStatus(id, status, context, notes, reasonCode);
      res.status(200).json({ success: true, message: req.t("order.fulfillment_updated"), data: result });
    } catch (error) {
      handleError(res, error, "orderController.updateFulfillment");
    }
  },

  async updateLifecycle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes, reasonCode, settleWithCash } = updateLifecycleSchema.parse(req.body);
      const user = (req as any).user;
      
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };

      const result = await orderService.updateLifecycle(id, status, context, notes, reasonCode, { settleWithCash });
      res.status(200).json({ success: true, message: req.t("order.lifecycle_updated"), data: result });
    } catch (error) {
      handleError(res, error, "orderController.updateLifecycle");
    }
  },

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const itemData = orderItemSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.addItem(id, itemData, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.addItem");
    }
  },

  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const { quantity } = updateItemQuantitySchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.updateItemQuantity(id, itemId, quantity, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.updateItemQuantity");
    }
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.removeItem(id, itemId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.removeItem");
    }
  },

  async voidItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const { reason } = voidItemSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.voidItem(id, itemId, reason, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.voidItem");
    }
  },

  async print(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.recordPrint(id, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.print");
    }
  },

  async moveTable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetTableId } = moveTableSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.moveTable(id, targetTableId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.moveTable");
    }
  },

  async mergeOrders(req: Request, res: Response): Promise<void> {
    try {
      const { id: sourceOrderId } = req.params;
      const { targetOrderId } = mergeOrdersSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.mergeOrders(sourceOrderId, targetOrderId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.mergeOrders");
    }
  },

  async splitOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { itemIds, targetTableId } = splitOrderSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.splitOrder(id, itemIds, context, targetTableId);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.splitOrder");
    }
  },

  async applyCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code } = applyCouponSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.applyCoupon(id, code, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.applyCoupon");
    }
  },

  async addPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const paymentData = addPaymentSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.addPayment(id, paymentData, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.addPayment");
    }
  },

  async refundOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = refundOrderSchema.parse(req.body);
      const user = (req as any).user;
      const context = { 
        userId: user.id,
        role: user.role,
        branchId: user.branchId
      };
      const result = await orderService.refundOrder(id, reason, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.refundOrder");
    }
  }
};

export default orderController;
