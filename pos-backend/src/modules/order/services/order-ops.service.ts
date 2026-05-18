import { db } from "../../../config/database.js";
import { fail } from "../../../utils/errorHandler.js";
import orderRepository from "../order.repository.js";
import tableRepository from "../../table/table.repository.js";
import { orderBaseService } from "./order-base.service.js";
import couponRepository from "../../coupon/coupon.repository.js";
import { ServiceContext } from "./order-item.service.js";

export const orderOpsService = {
  async moveTable(orderId: string, targetTableId: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("Order not found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("Access denied", 403);
      if (!["DINE_IN", "QR_SELF"].includes(order.orderType)) fail("Only table-based orders can be moved", 422);

      const targetTable = await tableRepository.findByIdWithLock(targetTableId, tx);
      if (!targetTable) fail("Target table not found", 404);
      const tt = targetTable!;
      if (tt.status === "Occupied") fail(`Table ${tt.tableNo} is already occupied`, 422);

      const oldTableId = order.tableId;
      await orderRepository.update(orderId, { tableId: targetTableId, version: order.version }, tx);
      if (oldTableId) await tableRepository.update(oldTableId, { status: "Available", currentOrderId: null }, tx);
      await tableRepository.update(targetTableId, { status: "Occupied", currentOrderId: orderId }, tx);

      await orderRepository.recordStatusChange({
        orderId, changeType: "TABLE_MOVE", fromValue: oldTableId, toValue: targetTableId,
        actorId: userId, reasonCode: "USER_REQUEST", notes: `Moved from ${oldTableId} to ${targetTableId}`,
        grandTotal: order.grandTotal
      }, tx);

      return { success: true, message: "Order moved successfully" };
    });
  },

  async mergeOrders(sourceOrderId: string, targetOrderId: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    if (sourceOrderId === targetOrderId) fail("Cannot merge an order into itself", 400);
    if (role !== "manager" && role !== "admin") fail("Unauthorized: Only managers can merge orders", 403);

    return await db.transaction(async (tx) => {
      const { a: source, b: target } = await orderRepository.lockOrdersByCanonicalOrder(sourceOrderId, targetOrderId, tx);

      if (!source || !target) fail("Order(s) not found", 404);
      if (role !== "admin" && (source.branchId !== branchId || target.branchId !== branchId)) fail("Access denied", 403);

      if (source.lifecycle !== "ACTIVE" || target.lifecycle !== "ACTIVE") fail("Only ACTIVE orders can be merged", 422);
      if (source.paymentStatus !== "UNPAID") fail("Cannot merge a source order that has payments recorded", 422);
      if (target.paymentStatus !== "UNPAID") fail("Cannot merge onto a target order that has payments recorded", 422);

      const activeItems = await orderRepository.getActiveItems(sourceOrderId, tx);
      if (activeItems.length === 0) fail("Source order has no active items to merge", 422);

      for (const item of activeItems) await orderRepository.updateItem(item.id, { orderId: targetOrderId }, tx);

      await orderRepository.recordStatusChange({
        orderId: targetOrderId, changeType: "MERGE_TARGET", fromValue: target.lifecycle, toValue: target.lifecycle,
        actorId: userId, reasonCode: "MERGE_TARGET", notes: `Merged items from order ${source.orderNumber}`,
        grandTotal: target.grandTotal
      }, tx);

      await orderRepository.recordStatusChange({
        orderId: sourceOrderId, changeType: "LIFECYCLE", fromValue: source.lifecycle, toValue: "VOIDED",
        actorId: userId, reasonCode: "MERGE_SOURCE", notes: `Merged into order ${target.orderNumber}`,
        grandTotal: source.grandTotal, currentVersion: source.version
      }, tx);

      if (source.tableId) await tableRepository.update(source.tableId, { status: "Available", currentOrderId: null }, tx);

      await orderBaseService._recalculateTotals(targetOrderId, tx);
      return { success: true, message: "Orders merged successfully" };
    });
  },

  async splitOrder(sourceOrderId: string, splitItems: string[], context: ServiceContext, targetTableId: string | null = null): Promise<any> {
    const { userId, role, branchId } = context;
    if (role !== "manager" && role !== "admin") fail("Unauthorized: Only managers can split orders", 403);

    return await db.transaction(async (tx) => {
      const source = await orderRepository.findByIdWithLock(sourceOrderId, tx);
      if (!source) fail("Source order not found", 404);
      if (source.branchId !== branchId && role !== "admin") fail("Access denied", 403);
      if (source.lifecycle !== "ACTIVE") fail(`Cannot split a ${source.lifecycle} order`, 422);

      const newOrderNumber = await orderBaseService._generateOrderNumber(source.branchId, tx);

      if (targetTableId) {
        const targetTable = await tableRepository.findByIdWithLock(targetTableId, tx);
        if (!targetTable) fail("Target table not found", 404);
        const tt = targetTable!;
        if (tt.status === "Occupied") fail(`Table ${tt.tableNo} is already occupied`, 422);
      }

      const newOrder = await orderBaseService._createOrderWithBill({
        branchId: source.branchId, posPointId: source.posPointId, shiftId: source.shiftId,
        openedById: userId, customerId: source.customerId, orderType: source.orderType,
        lifecycle: "ACTIVE", fulfillmentStatus: "PENDING", paymentStatus: "UNPAID",
        tableId: targetTableId, guestCount: 1, subtotal: "0.00", taxTotal: "0.00",
        grandTotal: "0.00", orderNumber: newOrderNumber
      }, [], tx);

      const sourceWithItems = await orderRepository.findById(sourceOrderId, tx);
      for (const itemId of splitItems) {
        const item = sourceWithItems.orderItems.find((i: any) => i.id === itemId);
        if (!item || item.isVoided) fail(`Item ${itemId} not found or voided`, 404);
        await orderRepository.updateItem(item.id, { orderId: newOrder.id }, tx);
      }

      const updatedSource = await orderBaseService._recalculateTotals(sourceOrderId, tx);
      await orderBaseService._recalculateTotals(newOrder.id, tx);

      const newOrderActiveCount = await orderRepository.countActiveItems(newOrder.id, tx);
      if (newOrderActiveCount === 0) fail("Split produced an empty order — no items were moved", 422);

      await orderRepository.recordStatusChange({
        orderId: sourceOrderId, changeType: "SPLIT_SOURCE", fromValue: source.lifecycle, toValue: source.lifecycle,
        actorId: userId, reasonCode: "SPLIT_SOURCE", notes: `Split items to new order ${newOrder.orderNumber}`,
        grandTotal: updatedSource.grandTotal
      }, tx);

      return { success: true, newOrderId: newOrder.id, newOrderNumber: newOrder.orderNumber };
    });
  },

  async applyCoupon(orderId: string, couponCode: string, context: ServiceContext): Promise<any> {
    const { userId, branchId, role } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("Order not found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("Access denied", 403);
      if (["COMPLETED", "VOIDED", "CANCELLED"].includes(order.lifecycle)) {
        fail(`Cannot modify coupons on a ${order.lifecycle.toLowerCase()} order`, 422);
      }

      if (!couponCode) fail("Use the remove-coupon endpoint to clear a coupon", 400);
      const coupon = await couponRepository.findByCodeWithLock(couponCode, tx);
      if (!coupon || !coupon.isActive) fail("Invalid or inactive coupon", 422);
      const cp = coupon!;
      if (cp.validUntil && new Date(cp.validUntil) < new Date()) fail("Coupon expired", 422);

      if (cp.usageLimitPerCustomer) {
        const customerUsage = await orderRepository.countCouponUsage(order.customerId, couponCode, tx);
        if (customerUsage >= cp.usageLimitPerCustomer) fail("Coupon usage limit per customer reached", 422);
      }

      if (cp.totalUsageLimit) {
        const globalUsage = await orderRepository.countCouponUsage(null, couponCode, tx);
        if (globalUsage >= cp.totalUsageLimit) fail("Global coupon usage limit reached", 422);
      }

      await orderRepository.update(orderId, { couponCode, version: order.version }, tx);
      await orderBaseService._recalculateTotals(orderId, tx);

      return { success: true, message: "Coupon applied" };
    });
  }
};
