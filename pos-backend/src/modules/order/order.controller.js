import orderService from "./order.service.js";
import { handleError, fail } from "../../utils/errorHandler.js";
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

const orderController = {
  async getAll(req, res) {
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
      } = req.query;

      const filters = {
        page, pageSize, lifecycle, fulfillmentStatus, paymentStatus, type, tableId, shiftId, customerId,
        includeItems: includeItems === 'true',
        branchId: (() => {
          if (req.user.role !== "admin") return req.user.branchId;
          const raw = req.query.branchId;
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const context = {
        role: req.user.role,
        branchId: req.user.branchId
      };
      const order = await orderService.getOrderById(id, context);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      handleError(res, error, "orderController.getById");
    }
  },

  /**
   * SECURE CREATE
   */
  async create(req, res) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      
      const context = {
        branchId: req.user.branchId,
        userId: req.user.id,
        shiftId: req.user.activeShiftId,
        posPointId: req.user.activePosPointId,
      };

      const newOrder = await orderService.createOrder(validatedData, context);
      res.status(201).json({ success: true, message: "Order created successfully", data: newOrder });
    } catch (error) {
      handleError(res, error, "orderController.create");
    }
  },

  async confirmDraft(req, res) {
    try {
      const { id } = req.params;
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.confirmDraft(id, context);
      res.status(200).json({ success: true, message: "Draft confirmed", data: result });
    } catch (error) {
      handleError(res, error, "orderController.confirmDraft");
    }
  },

  /**
   * UPDATE FULFILLMENT STATUS
   * Used by Kitchen (KDS) or Servers
   */
  async updateFulfillment(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, reasonCode } = updateFulfillmentStatusSchema.parse(req.body);
      
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };

      const result = await orderService.updateFulfillmentStatus(id, status, context, notes, reasonCode);
      res.status(200).json({ success: true, message: "Fulfillment status updated", data: result });
    } catch (error) {
      handleError(res, error, "orderController.updateFulfillment");
    }
  },

  /**
   * UPDATE LIFECYCLE STATUS
   * Used by Managers or for Finalization
   */
  async updateLifecycle(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, reasonCode, settleWithCash } = updateLifecycleSchema.parse(req.body);
      
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };

      const result = await orderService.updateLifecycle(id, status, context, notes, reasonCode, { settleWithCash });
      res.status(200).json({ success: true, message: "Order lifecycle updated", data: result });
    } catch (error) {
      handleError(res, error, "orderController.updateLifecycle");
    }
  },

  // --- DYNAMIC ITEM MANAGEMENT ---

  async addItem(req, res) {
    try {
      const { id } = req.params;
      const itemData = orderItemSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.addItem(id, itemData, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.addItem");
    }
  },

  async updateItemQuantity(req, res) {
    try {
      const { id, itemId } = req.params;
      const { quantity } = updateItemQuantitySchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.updateItemQuantity(id, itemId, quantity, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.updateItemQuantity");
    }
  },

  async removeItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.removeItem(id, itemId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.removeItem");
    }
  },

  async voidItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const { reason } = voidItemSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.voidItem(id, itemId, reason, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.voidItem");
    }
  },

  async print(req, res) {
    try {
      const { id } = req.params;
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.recordPrint(id, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.print");
    }
  },

  async moveTable(req, res) {
    try {
      const { id } = req.params;
      const { targetTableId } = moveTableSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.moveTable(id, targetTableId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.moveTable");
    }
  },

  async mergeOrders(req, res) {
    try {
      const { id: sourceOrderId } = req.params;
      const { targetOrderId } = mergeOrdersSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.mergeOrders(sourceOrderId, targetOrderId, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.mergeOrders");
    }
  },

  async splitOrder(req, res) {
    try {
      const { id } = req.params;
      const { itemIds, targetTableId } = splitOrderSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.splitOrder(id, itemIds, context, targetTableId);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.splitOrder");
    }
  },

  async applyCoupon(req, res) {
    try {
      const { id } = req.params;
      const { code } = applyCouponSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.applyCoupon(id, code, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.applyCoupon");
    }
  },

  async addPayment(req, res) {
    try {
      const { id } = req.params;
      const paymentData = addPaymentSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.addPayment(id, paymentData, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.addPayment");
    }
  },

  async refundOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = refundOrderSchema.parse(req.body);
      const context = { 
        userId: req.user.id,
        role: req.user.role,
        branchId: req.user.branchId
      };
      const result = await orderService.refundOrder(id, reason, context);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error, "orderController.refundOrder");
    }
  }
};

export default orderController;
