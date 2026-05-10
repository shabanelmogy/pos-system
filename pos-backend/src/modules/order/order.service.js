import orderRepository from "./order.repository.js";
import { fail } from "../../utils/errorHandler.js";

const orderService = {
  async getAllOrders() {
    return await orderRepository.findAll();
  },

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      fail("Order not found", 404);
    }
    return order;
  },

  async createOrder(orderData) {
    return await orderRepository.create(orderData);
  },

  async updateOrderStatus(id, status) {
    const order = await orderRepository.findById(id);
    if (!order) {
      fail("Order not found", 404);
    }
    return await orderRepository.update(id, { orderStatus: status });
  }
};

export default orderService;
