import { Decimal } from "decimal.js";
import { sql, eq } from "drizzle-orm";
import { fail } from "../../../utils/errorHandler.js";
import orderRepository from "../order.repository.js";
import billRepository from "../../bill/bill.repository.js";
import pricingService from "../../../utils/pricingService.js";
import couponRepository from "../../coupon/coupon.repository.js";
import { orderSequences } from "../orderSequence.schema.js";
import { branches } from "../../branch/branch.schema.js";
import logger from "../../../utils/logger.js";

/**
 * SHARED STATE MACHINES
 */
export const FULFILLMENT_TRANSITIONS = {
  PENDING: ["PREPARING", "READY"],
  PREPARING: ["PARTIALLY_READY", "READY"],
  PARTIALLY_READY: ["READY"],
  READY: ["SERVED", "DISPATCHED", "PICKED_UP"],
  DISPATCHED: ["DELIVERED"],
  SERVED: [],
  DELIVERED: [],
  PICKED_UP: []
};

export const TYPE_FULFILLMENT_GUARDS = {
  DINE_IN: ["PENDING", "PREPARING", "PARTIALLY_READY", "READY", "SERVED"],
  TAKE_AWAY: ["PENDING", "PREPARING", "PARTIALLY_READY", "READY", "PICKED_UP"],
  DELIVERY: ["PENDING", "PREPARING", "PARTIALLY_READY", "READY", "DISPATCHED", "DELIVERED"],
  QR_SELF: ["PENDING", "PREPARING", "PARTIALLY_READY", "READY", "SERVED"],
  PHONE: ["PENDING", "PREPARING", "PARTIALLY_READY", "READY", "DISPATCHED", "DELIVERED", "PICKED_UP"]
};

export const LIFECYCLE_TRANSITIONS = {
  DRAFT: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "VOIDED", "CANCELLED"],
  COMPLETED: [],
  VOIDED: [],
  CANCELLED: []
};

export const PAYMENT_TRANSITIONS = {
  UNPAID: ["PARTIALLY_PAID", "PAID"],
  PARTIALLY_PAID: ["PAID", "REFUNDED"],
  PAID: ["REFUNDED"],
  REFUNDED: []
};

/**
 * BASE ORDER SERVICE (Internal Utilities)
 */
export const orderBaseService = {
  _validatePaymentTransition(from, to) {
    const allowed = PAYMENT_TRANSITIONS[from];
    if (allowed === undefined) fail(`Unknown payment status: ${from}`, 422);
    if (!allowed.includes(to)) {
      const terminal = allowed.length === 0 ? " (terminal state)" : "";
      fail(`Illegal payment transition: ${from} → ${to}${terminal}`, 422);
    }
  },

  _guardAgainstPaidModification(order, role) {
    if (order.paymentStatus !== "UNPAID" && role !== "manager" && role !== "admin") {
      fail(`Cannot modify items on a ${order.paymentStatus} order. Manager approval required.`, 403);
    }
  },

  async _generateOrderNumber(branchId, tx) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const dateCompact = dateStr.replace(/-/g, '');

    const branch = await tx.query.branches.findFirst({
      where: eq(branches.id, branchId)
    });
    const prefix = branch?.code || "ORD";

    const [seq] = await tx.insert(orderSequences)
      .values({ branchId, date: dateStr, lastNumber: 1 })
      .onConflictDoUpdate({
        target: [orderSequences.branchId, orderSequences.date],
        set: { lastNumber: sql`${orderSequences.lastNumber} + 1` }
      })
      .returning();

    return `${prefix}-${dateCompact}-${seq.lastNumber.toString().padStart(4, '0')}`;
  },

  async _createOrderWithBill(orderData, itemsWithModifiers, tx) {
    const newOrder = await orderRepository.create(orderData, itemsWithModifiers, tx);

    await billRepository.create({
      orderId: newOrder.id,
      billNo: `BILL-${newOrder.orderNumber}`,
      totalAmount: orderData.subtotal ?? "0.00",
      taxAmount: orderData.taxTotal ?? "0.00",
      payableAmount: orderData.grandTotal ?? "0.00",
      status: "Unpaid"
    }, tx);

    return newOrder;
  },

  async _recalculateTotals(orderId, tx) {
    const updatedOrder = await orderRepository.findById(orderId, tx);
    if (!updatedOrder) return;

    const { taxRate, serviceChargeRate } = await pricingService.getBranchRates(updatedOrder.branchId, tx);

    let totalSubtotal = new Decimal(0);
    let totalDiscount = new Decimal(0);

    for (const item of updatedOrder.orderItems) {
      if (item.isVoided) continue;
      totalSubtotal = totalSubtotal.add(new Decimal(item.subtotal));
      totalDiscount = totalDiscount.add(new Decimal(item.discountAmount || "0"));
    }

    let couponDiscountAmount = null;
    if (updatedOrder.couponCode) {
      const coupon = await couponRepository.findByCode(updatedOrder.couponCode);
      if (coupon) {
        let disc;
        if (coupon.type === "PERCENTAGE") {
          disc = totalSubtotal.mul(new Decimal(coupon.value).div(100));
          if (coupon.maxDiscountAmount) disc = Decimal.min(disc, new Decimal(coupon.maxDiscountAmount));
        } else {
          disc = Decimal.min(new Decimal(coupon.value), totalSubtotal);
        }
        couponDiscountAmount = disc.toFixed(2);
      }
    }

    const totals = pricingService.calcOrderTotals(totalSubtotal, totalDiscount, taxRate, serviceChargeRate, couponDiscountAmount);
    await orderRepository.update(orderId, { ...totals, version: updatedOrder.version }, tx);

    const bill = await billRepository.findByOrderId(orderId, tx);
    if (!bill) {
      logger.error("Data Integrity Error: Missing bill record for order", { orderId });
      fail("Critical Error: Order bill record is missing", 500);
    }

    await billRepository.update(bill.id, {
      totalAmount: totals.subtotal,
      taxAmount: totals.taxTotal,
      payableAmount: totals.grandTotal
    }, tx);

    return await orderRepository.findById(orderId, tx);
  }
};
