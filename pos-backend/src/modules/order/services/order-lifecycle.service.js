import { Decimal } from "decimal.js";
import { db } from "../../../config/database.js";
import { fail } from "../../../utils/errorHandler.js";
import logger from "../../../utils/logger.js";
import orderRepository from "../order.repository.js";
import itemRepository from "../../item/item.repository.js";
import shiftRepository from "../../shift/shift.repository.js";
import tableRepository from "../../table/table.repository.js";
import pricingService from "../../../utils/pricingService.js";
import paymentRepository from "../../payment/payment.repository.js";
import orderEventEmitter, { ORDER_EVENTS } from "../../../utils/events.js";
import customerService from "../../customer/customer.service.js";
import { 
  orderBaseService, 
  FULFILLMENT_TRANSITIONS, 
  TYPE_FULFILLMENT_GUARDS, 
  LIFECYCLE_TRANSITIONS 
} from "./order-base.service.js";

export const orderLifecycleService = {
  async getAllOrders(filters) {
    return await orderRepository.findAll(filters);
  },

  async getOrderById(id, context = {}) {
    const order = await orderRepository.findById(id);
    if (!order) fail("Order not found", 404);
    if (context.role !== "admin" && order.branchId !== context.branchId) fail("Access denied", 403);
    return order;
  },

  async createOrder(data, context) {
    const { branchId, userId, shiftId, posPointId } = context;
    const { type, items: requestItems, customerId, customerDetails, tableId, metadata, guestCount, idempotencyKey } = data;

    return await db.transaction(async (tx) => {
      if (idempotencyKey) {
        const existing = await orderRepository.findByIdempotencyKey(idempotencyKey, tx);
        if (existing) {
          if (existing.branchId !== branchId) fail("Access denied", 403);
          return existing;
        }
      }

      const shift = await shiftRepository.findShiftMinimal(shiftId, tx);
      if (!shift || shift.status.toLowerCase() !== "open" || shift.branchId !== branchId) fail("Invalid shift", 422);

      const { taxRate, serviceChargeRate } = await pricingService.getBranchRates(branchId, tx);

      // The table row lock (FOR UPDATE) is held for the entire transaction duration by
      // Postgres, so tableRepository.update() below is safe even though several async
      // operations occur between the lock-check and the status flip. This is not a TOCTOU.
      if (["DINE_IN", "QR_SELF"].includes(type) && tableId) {
        const table = await tableRepository.findByIdWithLock(tableId, tx);
        if (!table || table.status === "Occupied") fail("Table unavailable", 422);
      }

      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        const customer = await customerService.findOrCreateByPhone(customerDetails?.name || "Guest", customerDetails?.phone || "0000000000");
        finalCustomerId = customer.id;
      }

      const menuItemIds = [...new Set(requestItems.map(i => i.menuItemId))];
      const products = await itemRepository.findByIds(menuItemIds);
      const productMap = new Map(products.map(p => [p.id, p]));

      const modifierIds = [...new Set(requestItems.flatMap(i => i.modifiers || []).map(m => m.modifierId))];
      const modifiers = modifierIds.length > 0 ? await itemRepository.findModifiersByIds(modifierIds) : [];
      const modifierMap = new Map(modifiers.map(m => [m.id, m]));

      let totalSubtotal = new Decimal(0);
      const orderItemsToCreate = [];

      for (const reqItem of requestItems) {
        const product = productMap.get(reqItem.menuItemId);
        if (!product) fail(`Product ${reqItem.menuItemId} not found`, 404);
        
        let itemSubtotal = new Decimal(product.price).mul(new Decimal(reqItem.quantity));
        const validatedModifiers = [];

        if (reqItem.modifiers?.length > 0) {
          for (const reqMod of reqItem.modifiers) {
            const m = modifierMap.get(reqMod.modifierId);
            if (!m) fail(`Modifier ${reqMod.modifierId} not found`, 404);
            const mPrice = new Decimal(m.price);
            const mQty = new Decimal(reqMod.quantity || 1);
            itemSubtotal = itemSubtotal.add(mPrice.mul(mQty));
            validatedModifiers.push({
              modifierId: m.id,
              name: m.name,
              unitPrice: mPrice.toFixed(2),
              quantity: mQty.toNumber()
            });
          }
        }

        totalSubtotal = totalSubtotal.add(itemSubtotal);
        orderItemsToCreate.push({
          data: {
            menuItemId: product.id, nameSnapshot: product.name, unitPrice: product.price,
            quantity: reqItem.quantity, subtotal: itemSubtotal.toFixed(2),
            taxAmount: pricingService.calcItemTax(itemSubtotal, taxRate),
            status: "PENDING", notes: reqItem.notes, kitchenStationId: product.kitchenStationId
          },
          modifiers: validatedModifiers
        });
      }

      const totals = pricingService.calcOrderTotals(totalSubtotal, new Decimal(0), taxRate, serviceChargeRate);
      const orderNumber = await orderBaseService._generateOrderNumber(branchId, tx);

      const newOrder = await orderBaseService._createOrderWithBill({
        branchId, posPointId, shiftId, openedById: userId, customerId: finalCustomerId,
        orderType: type, lifecycle: "DRAFT", fulfillmentStatus: "PENDING", paymentStatus: "UNPAID",
        tableId, guestCount: guestCount || 1, subtotal: totalSubtotal.toFixed(2),
        taxTotal: totals.taxTotal, grandTotal: totals.grandTotal, metadata,
        orderNumber, idempotencyKey
      }, orderItemsToCreate, tx);

      if (["DINE_IN", "QR_SELF"].includes(type) && tableId) {
        await tableRepository.update(tableId, { status: "Occupied", currentOrderId: newOrder.id }, tx);
      }

      return newOrder;
    });
  },

  async confirmDraft(id, context) {
    const { userId, branchId, role } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(id, tx);
      if (!order) fail("Order not found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("Access denied", 403);
      if (order.lifecycle !== "DRAFT") fail(`Cannot confirm an order in ${order.lifecycle} state`, 422);

      const activeCount = await orderRepository.countActiveItems(id, tx);
      if (activeCount === 0) fail("Cannot confirm an empty order", 422);

      await orderRepository.recordStatusChange({
        orderId: id, changeType: "LIFECYCLE", fromValue: "DRAFT", toValue: "ACTIVE",
        actorId: userId, reasonCode: "CONFIRM_DRAFT", grandTotal: order.grandTotal,
        currentVersion: order.version
      }, tx);

      if (["DINE_IN", "QR_SELF"].includes(order.orderType) && order.tableId) {
        await tableRepository.update(order.tableId, { status: "Occupied", currentOrderId: id }, tx);
      }

      const updatedOrder = await orderRepository.findById(id, tx);
      // CONFIRMED is the canonical event for the DRAFT → ACTIVE transition.
      // All other lifecycle transitions emit LIFECYCLE_CHANGED (see updateLifecycle).
      // External listeners that care about ACTIVE state must handle CONFIRMED, not LIFECYCLE_CHANGED.
      orderEventEmitter.emit(ORDER_EVENTS.CONFIRMED, { order: updatedOrder, context });
      return updatedOrder;
    });
  },

  async updateFulfillmentStatus(id, status, context, notes, reasonCode) {
    const { userId, branchId, role } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(id, tx);
      if (!order) fail("Order not found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("Access denied", 403);

      const allowed = FULFILLMENT_TRANSITIONS[order.fulfillmentStatus];
      if (!allowed?.includes(status)) fail(`Illegal fulfillment transition: ${order.fulfillmentStatus} → ${status}`, 422);

      const guards = TYPE_FULFILLMENT_GUARDS[order.orderType];
      if (!guards.includes(status)) fail(`Status ${status} not allowed for ${order.orderType}`, 422);

      await orderRepository.recordStatusChange({
        orderId: id, changeType: "FULFILLMENT", fromValue: order.fulfillmentStatus, toValue: status,
        actorId: userId, reasonCode: reasonCode || "STATUS_UPDATE", notes, grandTotal: order.grandTotal,
        currentVersion: order.version
      }, tx);

      const updatedOrder = await orderRepository.findById(id, tx);
      orderEventEmitter.emit(ORDER_EVENTS.FULFILLMENT_CHANGED, { order: updatedOrder, context });
      return updatedOrder;
    });
  },

  async updateLifecycle(id, status, context, notes, reasonCode, options = {}) {
    const { userId, branchId, role } = context;
    const { settleWithCash } = options;

    const { updatedOrder, tableId } = await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(id, tx);
      if (!order) fail("Order not found", 404);
      if (role !== "admin" && order.branchId !== branchId) fail("Access denied", 403);

      const allowed = LIFECYCLE_TRANSITIONS[order.lifecycle];
      if (!allowed?.includes(status)) fail(`Illegal lifecycle transition: ${order.lifecycle} → ${status}`, 422);

      if (status === "VOIDED" || status === "CANCELLED") {
        if (status === "VOIDED" && role !== "manager" && role !== "admin") {
          fail("Unauthorized: Only managers can void orders", 403);
        }
        if (order.paymentStatus !== "UNPAID") fail(`Cannot ${status.toLowerCase()} order with payments`, 422);
        if (order.tableId) await tableRepository.update(order.tableId, { status: "Available", currentOrderId: null }, tx);
      }

      let currentVersion = order.version;

      if (status === "COMPLETED") {
        const balance = new Decimal(order.grandTotal).minus(order.totalPaid);
        if (balance.gt(0)) {
          if (!settleWithCash) fail(`Cannot complete order with outstanding balance of ${balance.toFixed(2)}`, 422);
          
          await paymentRepository.create({
            orderId: id, amount: balance.toFixed(2), method: "Cash",
            receivedById: userId, status: "SUCCESS"
          }, tx);

          const afterPayment = await orderRepository.recordStatusChange({
            orderId: id, changeType: "PAYMENT", fromValue: order.paymentStatus, toValue: "PAID",
            actorId: userId, reasonCode: "SETTLE_ON_COMPLETE", notes: "Settled with cash on completion",
            grandTotal: order.grandTotal, currentVersion
          }, tx);

          const afterUpdate = await orderRepository.update(id, { totalPaid: order.grandTotal, version: afterPayment.version }, tx);
          currentVersion = afterUpdate.version;
        } else if (order.paymentStatus !== "PAID") {
          logger.error("Data integrity error: zero balance but paymentStatus is not PAID", { orderId: id, paymentStatus: order.paymentStatus });
          fail("Internal error: payment status inconsistency detected. Contact support.", 500);
        }

        // Free up the table when order is completed
        if (order.tableId) await tableRepository.update(order.tableId, { status: "Available", currentOrderId: null }, tx);
      }

      await orderRepository.recordStatusChange({
        orderId: id, changeType: "LIFECYCLE", fromValue: order.lifecycle, toValue: status,
        actorId: userId, reasonCode: reasonCode || "STATUS_UPDATE", notes, grandTotal: order.grandTotal,
        currentVersion
      }, tx);

      const updatedOrder = await orderRepository.findById(id, tx);
      return { updatedOrder, tableId: order.tableId };
    });

    // Emit socket events AFTER the transaction commits so clients fetch committed data
    setImmediate(() => {
      orderEventEmitter.emit(ORDER_EVENTS.LIFECYCLE_CHANGED, { order: updatedOrder, context });
      if (tableId && (status === "COMPLETED" || status === "VOIDED" || status === "CANCELLED")) {
        orderEventEmitter.emit("table_updated", { table: { id: tableId, status: "Available" }, branchId: context.branchId });
      }
    });

    return updatedOrder;
  },

  async recordPrint(id, context) {
    const { branchId, role } = context;
    const order = await orderRepository.findById(id);
    if (!order) fail("Order not found", 404);
    if (role !== "admin" && order.branchId !== branchId) fail("Access denied", 403);

    if (!order.firstPrintedAt) {
      try {
        await db.transaction(async (tx) => {
          await orderRepository.update(id, { firstPrintedAt: new Date(), version: order.version }, tx);
        });
      } catch (error) {
        // INTENTIONAL: idempotent. A 409 means another concurrent request already set
        // firstPrintedAt — the desired state is achieved either way, so swallow it.
        if (error.statusCode !== 409) throw error;
      }
    }
    return { success: true };
  }
};
