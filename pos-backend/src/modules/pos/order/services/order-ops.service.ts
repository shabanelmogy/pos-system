import { db } from "../../../../config/database.js";
import { fail } from "../../../../utils/errorHandler.js";
import orderRepository from "../order.repository.js";
import tableRepository from "../../table/table.repository.js";
import { orderBaseService } from "./order-base.service.js";
import couponRepository from "../../../catalog/coupon/coupon.repository.js";
import { ServiceContext } from "./order-item.service.js";

export const orderOpsService = {
  async moveTable(orderId: string, targetTableId: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);
      if (!["DINE_IN", "QR_SELF"].includes(order.orderType)) fail("order.not_table_based", 422);

      const targetTable = await tableRepository.findByIdWithLock(targetTableId, tx);
      if (!targetTable) fail("order.target_table_not_found", 404);
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

      return { success: true, message: "order.moved_success" };
    });
  },

  async mergeOrders(sourceOrderId: string, targetOrderId: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    if (sourceOrderId === targetOrderId) fail("order.cannot_merge_self", 400);
    if (role !== "manager" && role !== "admin") fail("errors.unauthorized_merge", 403);

    return await db.transaction(async (tx) => {
      const { a: source, b: target } = await orderRepository.lockOrdersByCanonicalOrder(sourceOrderId, targetOrderId, tx);

      if (!source || !target) fail("order.orders_not_found", 404);
      if (role !== "admin" && (source.branchId !== branchId || target.branchId !== branchId)) fail("errors.access_denied", 403);

      if (source.lifecycle !== "ACTIVE" || target.lifecycle !== "ACTIVE") fail("order.merge_must_be_active", 422);
      if (source.paymentStatus !== "UNPAID") fail("order.merge_source_has_payments", 422);
      if (target.paymentStatus !== "UNPAID") fail("order.merge_target_has_payments", 422);

      const activeItems = await orderRepository.getActiveItems(sourceOrderId, tx);
      if (activeItems.length === 0) fail("order.merge_no_active_items", 422);

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
      return { success: true, message: "order.merged_success" };
    });
  },

  async splitOrder(sourceOrderId: string, splitItems: string[], context: ServiceContext, targetTableId: string | null = null): Promise<any> {
    const { userId, role, branchId } = context;
    if (role !== "manager" && role !== "admin") fail("errors.unauthorized_split", 403);

    return await db.transaction(async (tx) => {
      const source = await orderRepository.findByIdWithLock(sourceOrderId, tx);
      if (!source) fail("order.source_order_not_found", 404);
      if (source.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);
      if (source.lifecycle !== "ACTIVE") fail(`Cannot split a ${source.lifecycle} order`, 422);

      const newOrderNumber = await orderBaseService._generateOrderNumber(source.branchId, tx);

      if (targetTableId) {
        const targetTable = await tableRepository.findByIdWithLock(targetTableId, tx);
        if (!targetTable) fail("order.target_table_not_found", 404);
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
      if (newOrderActiveCount === 0) fail("order.split_empty", 422);

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
      if (!order) fail("order.not_found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("errors.access_denied", 403);
      if (["COMPLETED", "VOIDED", "CANCELLED"].includes(order.lifecycle)) {
        fail(`Cannot modify coupons on a ${order.lifecycle.toLowerCase()} order`, 422);
      }

      if (!couponCode) fail("order.use_remove_coupon", 400);
      const coupon = await couponRepository.findByCodeWithLock(couponCode, tx);
      if (!coupon || !coupon.isActive) fail("order.coupon_inactive", 422);
      const cp = coupon!;
      if (cp.validUntil && new Date(cp.validUntil) < new Date()) fail("order.coupon_expired", 422);

      if (cp.usageLimitPerCustomer) {
        const customerUsage = await orderRepository.countCouponUsage(order.customerId, couponCode, tx);
        if (customerUsage >= cp.usageLimitPerCustomer) fail("order.coupon_limit_per_customer", 422);
      }

      if (cp.totalUsageLimit) {
        const globalUsage = await orderRepository.countCouponUsage(null, couponCode, tx);
        if (globalUsage >= cp.totalUsageLimit) fail("order.coupon_global_limit", 422);
      }

      await orderRepository.update(orderId, { couponCode, version: order.version }, tx);
      await orderBaseService._recalculateTotals(orderId, tx);

      return { success: true, message: "order.coupon_applied" };
    });
  }
};
