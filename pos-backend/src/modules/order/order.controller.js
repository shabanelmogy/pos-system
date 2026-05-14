import orderService from "./order.service.js";
import userService from "../user/user.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation.js";

const orderController = {
  async getAll(req, res) {
    try {
      let { branchId, posPointId, shiftId, cashierId, startDate, endDate, customerId } = req.query;
      
      // 1. Fetch full user to check role
      const user = await userService.getUserById(req.user._id);
      if (!user) {
          return res.status(401).json({ success: false, message: "User session invalid" });
      }

      const role = (user.role || "").toLowerCase();

      // 2. Security Enforcement: For non-admins, force filtering by their branch
      if (role !== "admin") {
          const permissions = user.posPermissions || [];
          const assignedPosIds = permissions.map(p => p.posPointId);
          
          // Force Branch
          branchId = user.branchId;

          // Validate or Default POS ID
          if (posPointId) {
              if (!assignedPosIds.includes(posPointId)) {
                  posPointId = assignedPosIds[0] || null;
              }
          } else {
              posPointId = assignedPosIds[0] || null;
          }

          // If still no POS ID and not admin, return empty results early to avoid DB crash
          if (!posPointId) {
              return res.status(200).json({ success: true, data: [] });
          }
      }

      const orders = await orderService.getAllOrders({ 
          branchId, 
          posPointId, 
          shiftId, 
          cashierId,
          startDate, 
          endDate,
          customerId
      });

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      handleError(res, error, "orderController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      handleError(res, error, "orderController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const newOrder = await orderService.createOrder(validatedData);
      res.status(201).json({ success: true, message: "Order created successfully", data: newOrder });
    } catch (error) {
      handleError(res, error, "orderController.create");
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { orderStatus } = updateOrderStatusSchema.parse(req.body);
      const updatedOrder = await orderService.updateOrderStatus(id, orderStatus);
      res.status(200).json({ success: true, message: "Order status updated successfully", data: updatedOrder });
    } catch (error) {
      handleError(res, error, "orderController.updateStatus");
    }
  }
};

export default orderController;
