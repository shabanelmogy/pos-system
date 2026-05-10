import orderService from "./order.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation.js";

const orderController = {
  async getAll(req, res) {
    try {
      const { branchId, posPointId, shiftId } = req.query;
      const orders = await orderService.getAllOrders({ branchId, posPointId, shiftId });
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
