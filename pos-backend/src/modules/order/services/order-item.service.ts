import { Decimal } from "decimal.js";
import { db } from "../../../config/database.js";
import { fail } from "../../../utils/errorHandler.js";
import orderRepository from "../order.repository.js";
import itemRepository from "../../item/item.repository.js";
import tableRepository from "../../table/table.repository.js";
import pricingService from "../../../utils/pricingService.js";
import { orderBaseService } from "./order-base.service.js";

export interface ServiceContext {
  userId: string;
  role: string;
  branchId: string;
}

export const orderItemService = {
  async addItem(orderId: string, itemData: any, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    const { menuItemId, quantity: reqQuantity, notes, modifiers: reqModifiers } = itemData;

    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);
      if (order.lifecycle !== "ACTIVE") fail(`Cannot add items to an order in ${order.lifecycle} state`, 422);

      orderBaseService._guardAgainstPaidModification(order, role);

      const product = await itemRepository.findById(menuItemId);
      if (!product) fail("Product not found", 404);
      const prd = product!;

      const { taxRate } = await pricingService.getBranchRates(order.branchId, tx);

      const unitPrice = new Decimal(prd.price);
      const quantity = new Decimal(reqQuantity);
      let itemSubtotal = unitPrice.mul(quantity);

      const validatedModifiers: any[] = [];
      if (reqModifiers?.length > 0) {
        const modIds = reqModifiers.map((m: any) => m.modifierId);
        const mods = await itemRepository.findModifiersByIds(modIds);
        const modMap = new Map(mods.map((m: any) => [m.id, m]));

        for (const reqMod of reqModifiers) {
          const m = modMap.get(reqMod.modifierId);
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

      await orderRepository.addItem(orderId, {
        menuItemId: prd.id,
        nameSnapshot: prd.name,
        unitPrice: unitPrice.toFixed(2),
        quantity: quantity.toFixed(2),
        subtotal: itemSubtotal.toFixed(2),
        taxAmount: pricingService.calcItemTax(itemSubtotal, taxRate),
        notes,
        kitchenStationId: prd.kitchenStationId
      }, validatedModifiers, tx);

      const updatedOrder = await orderBaseService._recalculateTotals(orderId, tx);
      return { success: true, message: "order.item_added", order: updatedOrder };
    });
  },

  async updateItemQuantity(orderId: string, itemId: string, newQuantity: number, context: ServiceContext): Promise<any> {
    const { role, branchId } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);
      
      orderBaseService._guardAgainstPaidModification(order, role);

      const item = await orderRepository.findItemById(itemId, tx);
      if (!item || item.orderId !== orderId) fail("Item not found on this order", 404);
      if (item.isVoided) fail("Cannot update quantity of a voided item", 422);

      const { taxRate } = await pricingService.getBranchRates(order.branchId, tx);
      const oldQty = new Decimal(item.quantity);
      const nextQty = new Decimal(newQuantity);
      const discount = new Decimal(item.discountAmount || "0");
      // discountAmount is treated as a flat per-order-item amount (not per-unit).
      // When quantity changes, the discount stays fixed — only the base price scales.
      // Reverse-engineer the pre-discount unit price by adding the discount back before dividing.
      const unitPriceWithModifiers = new Decimal(item.subtotal).add(discount).div(oldQty);
      const nextSubtotal = unitPriceWithModifiers.mul(nextQty).minus(discount);

      await orderRepository.updateItem(itemId, {
        quantity: nextQty.toFixed(2),
        subtotal: nextSubtotal.toFixed(2),
        taxAmount: pricingService.calcItemTax(nextSubtotal, taxRate)
      }, tx);

      const updatedOrder = await orderBaseService._recalculateTotals(orderId, tx);
      return { success: true, order: updatedOrder };
    });
  },

  async removeItem(orderId: string, itemId: string, context: ServiceContext): Promise<any> {
    const { role, branchId, userId } = context;
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);
      if (!["ACTIVE", "DRAFT"].includes(order.lifecycle)) fail(`Cannot remove items from a ${order.lifecycle} order`, 422);

      orderBaseService._guardAgainstPaidModification(order, role);

      const item = await orderRepository.findItemById(itemId, tx);
      if (!item || item.orderId !== orderId) fail("Item not found on this order", 404);

      await orderRepository.removeItem(itemId, tx);
      // NOTE: _recalculateTotals internally calls orderRepository.update(), bumping the version.
      const updated = await orderBaseService._recalculateTotals(orderId, tx);

      const activeCount = await orderRepository.countActiveItems(orderId, tx);
      if (activeCount === 0) {
        if (order.tableId) await tableRepository.update(order.tableId, { status: "Available", currentOrderId: null }, tx);
        await orderRepository.recordStatusChange({
          orderId, changeType: "LIFECYCLE", fromValue: order.lifecycle, toValue: "CANCELLED",
          actorId: userId, reasonCode: "EMPTY_ORDER", notes: "Auto-cancelled: no items left",
          grandTotal: "0.00", currentVersion: updated.version
        }, tx);
        return { success: true, message: "Order auto-cancelled (empty)" };
      }
      return { success: true, order: updated };
    });
  },

  async voidItem(orderId: string, itemId: string, reason: string, context: ServiceContext): Promise<any> {
    const { userId, role, branchId } = context;
    if (role !== "manager" && role !== "admin") fail("Unauthorized: Manager approval required to void", 403);

    return await db.transaction(async (tx) => {
      const order = await orderRepository.findByIdWithLock(orderId, tx);
      if (!order) fail("order.not_found", 404);
      if (order.branchId !== branchId && role !== "admin") fail("errors.access_denied", 403);

      const item = await orderRepository.findItemById(itemId, tx);
      if (!item || item.orderId !== orderId) fail("Item not found on this order", 404);
      if (item.isVoided) fail("Item is already voided", 422);

      await orderRepository.voidItem(itemId, reason, userId, tx);
      const updated = await orderBaseService._recalculateTotals(orderId, tx);

      // grandTotal snapshot is intentionally taken before _recalculateTotals
      await orderRepository.recordStatusChange({
        orderId, changeType: "ITEM_VOID", fromValue: item.nameSnapshot, toValue: "VOIDED",
        actorId: userId, reasonCode: "VOID", notes: reason, grandTotal: order.grandTotal
      }, tx);

      const activeCount = await orderRepository.countActiveItems(orderId, tx);
      if (activeCount === 0) {
        if (order.tableId) await tableRepository.update(order.tableId, { status: "Available", currentOrderId: null }, tx);
        await orderRepository.recordStatusChange({
          orderId, changeType: "LIFECYCLE", fromValue: order.lifecycle, toValue: "CANCELLED",
          actorId: userId, reasonCode: "EMPTY_ORDER", notes: "Auto-cancelled: all items voided",
          grandTotal: "0.00", currentVersion: updated.version
        }, tx);
        return { success: true, message: "Order auto-cancelled (all voided)" };
      }
      return { success: true, order: updated };
    });
  }
};
