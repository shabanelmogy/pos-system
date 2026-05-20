import { Decimal } from "decimal.js";
import { db } from "../../../../config/database.js";
import { fail } from "../../../../utils/errorHandler.js";
import logger from "../../../../utils/logger.js";
import orderRepository from "../order.repository.js";
import paymentRepository from "../../payment/payment.repository.js";
import orderEventEmitter, { ORDER_EVENTS } from "../../../../utils/events.js";
import { orderBaseService } from "./order-base.service.js";
import { ServiceContext } from "./order-item.service.js";

export const orderPaymentService = {
  async addPayment(orderId: string, paymentData: any, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    const { amount, method, paymentId } = paymentData;

    if (new Decimal(amount).lte(0)) fail("errors.invalid_amount", 422);
    if (role !== "cashier" && role !== "manager" && role !== "admin") fail("errors.unauthorized_payment", 403);

    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("errors.access_denied", 403);
      if (!["ACTIVE"].includes(order.lifecycle)) fail(`Cannot add payment to a ${order.lifecycle} order`, 422);

      const paymentAmount = new Decimal(amount);
      const newTotalPaid = new Decimal(order.totalPaid).add(paymentAmount);
      const grandTotal = new Decimal(order.grandTotal);
      const remainingBalance = grandTotal.minus(order.totalPaid);

      if (paymentAmount.gt(remainingBalance)) {
        fail(`Payment amount ${paymentAmount.toFixed(2)} exceeds remaining balance of ${remainingBalance.toFixed(2)}`, 422);
      }

      let newStatus = "PARTIALLY_PAID";
      if (newTotalPaid.gte(grandTotal)) newStatus = "PAID";

      orderBaseService._validatePaymentTransition(order.paymentStatus, newStatus);

      await paymentRepository.create({
        orderId, amount: paymentAmount.toFixed(2), method, paymentId,
        status: "SUCCESS"
      }, tx);

      const updatedAfterStatus = await orderRepository.recordStatusChange({
        orderId, changeType: "PAYMENT", fromValue: order.paymentStatus, toValue: newStatus,
        actorId: userId, reasonCode: "PAYMENT_RECEIVED", notes: `Paid via ${method}`,
        grandTotal: order.grandTotal, currentVersion: order.version
      }, tx);

      await orderRepository.update(orderId, { totalPaid: newTotalPaid.toFixed(2), version: updatedAfterStatus!.version }, tx);

      const updatedOrder = await orderRepository.findById(orderId, tx);
      logger.info('Payment added', { orderId, amount, method, newStatus });
      orderEventEmitter.emit(ORDER_EVENTS.PAID, { order: updatedOrder, payment: paymentData, context });

      return { success: true, totalPaid: newTotalPaid.toFixed(2), status: newStatus };
    });
  },

  async refundOrder(orderId: string, reason: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    if (role !== "manager" && role !== "admin") fail("errors.unauthorized_refund", 403);

    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("errors.access_denied", 403);

      orderBaseService._validatePaymentTransition(order.paymentStatus, "REFUNDED");
      if (!["ACTIVE", "COMPLETED"].includes(order.lifecycle)) fail(`Cannot refund in ${order.lifecycle} state`, 422);

      const payments = await paymentRepository.findByOrderId(orderId, tx);
      for (const p of payments) await paymentRepository.update(p.id, { isRefunded: true }, tx);

      const updatedAfterPayment = await orderRepository.recordStatusChange({
        orderId, changeType: "PAYMENT", fromValue: order.paymentStatus, toValue: "REFUNDED",
        actorId: userId, reasonCode: "REFUND", notes: reason,
        grandTotal: order.grandTotal, currentVersion: order.version
      }, tx);

      await orderRepository.recordStatusChange({
        orderId, changeType: "LIFECYCLE", fromValue: order.lifecycle, toValue: "VOIDED",
        actorId: userId, reasonCode: "REFUND", notes: reason,
        grandTotal: order.grandTotal, currentVersion: updatedAfterPayment!.version
      }, tx);

      const updatedOrder = await orderRepository.findById(orderId, tx);
      logger.info("Order refunded", { orderId });
      orderEventEmitter.emit(ORDER_EVENTS.REFUNDED, { order: updatedOrder, context });

      return { success: true, message: "order.refund_success" };
    });
  },

  async updatePaymentStatus(orderId: string, newStatus: string, actorId: string, tx: any): Promise<any> {
    const order = await orderRepository.findByIdWithLock(orderId, tx);
    if (!order) fail("order.not_found", 404);

    orderBaseService._validatePaymentTransition(order.paymentStatus, newStatus);

    await orderRepository.recordStatusChange({
      orderId, changeType: "PAYMENT", fromValue: order.paymentStatus, toValue: newStatus,
      actorId, reasonCode: "MANUAL_UPDATE", grandTotal: order.grandTotal,
      currentVersion: order.version
    }, tx);

    return { success: true };
  }
};
