import { db } from "../../config/database.js";
import { orders, orderStatusHistory, Order, NewOrder } from "./order.schema.js";
import { orderItems, orderItemModifiers, OrderItem } from "./orderItem.schema.js";
import { eq, desc, and, sql, not, notInArray } from "drizzle-orm";
import { fail } from "../../utils/errorHandler.js";

export interface OrderFilters {
  branchId?: string;
  page?: number | string;
  pageSize?: number | string;
  lifecycle?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  type?: string;
  tableId?: string;
  shiftId?: string;
  customerId?: string;
  includeItems?: boolean | string;
}

const orderRepository = {
  async findAll(filters: OrderFilters = {}) {
    const { 
      branchId, 
      page = 1, 
      pageSize = 20,
      lifecycle,
      fulfillmentStatus,
      paymentStatus,
      type,
      tableId,
      shiftId,
      customerId,
      includeItems = false
    } = filters;
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const whereClauses: any[] = [];
    if (branchId) whereClauses.push(eq(orders.branchId, branchId));
    if (lifecycle) whereClauses.push(eq(orders.lifecycle, lifecycle as any));
    if (fulfillmentStatus) whereClauses.push(eq(orders.fulfillmentStatus, fulfillmentStatus as any));
    if (paymentStatus) whereClauses.push(eq(orders.paymentStatus, paymentStatus as any));
    if (type) whereClauses.push(eq(orders.orderType, type as any));
    if (tableId) whereClauses.push(eq(orders.tableId, tableId));
    if (shiftId) whereClauses.push(eq(orders.shiftId, shiftId));
    if (customerId) whereClauses.push(eq(orders.customerId, customerId));

    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    // 1. Get total count for metadata
    const [countResult] = await db.select({ count: sql`count(*)` }).from(orders).where(where);
    const total = Number(countResult?.count || 0);

    const isIncludeItems = includeItems === true || includeItems === "true";

    // 2. Get paginated results
    const results = await db.query.orders.findMany({
      where,
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
      with: isIncludeItems ? {
        table: true,
        orderItems: {
          with: {
            menuItem: true,
            modifiers: true,
          }
        }
      } : undefined
    });

    return {
      orders: results,
      pagination: {
        total,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      },
      slim: !isIncludeItems
    };
  },

  async findById(id: string, tx: any = db): Promise<any> {
    return await tx.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: {
          with: {
            menuItem: true,
            modifiers: true,
          }
        }
      }
    });
  },

  async findByIdWithLock(id: string, tx: any = db): Promise<any> {
    await tx.execute(sql`SELECT 1 FROM orders WHERE id = ${id} FOR UPDATE`);
    return await this.findById(id, tx);
  },

  /**
   * CANONICAL MULTI-ORDER LOCK
   *
   * Acquires FOR UPDATE locks on two orders in a deterministic order to prevent
   * deadlocks. This is a system-wide contract:
   *
   *   RULE: Every code path that locks more than one order row in the same
   *         transaction MUST acquire those locks in ascending UUID sort order.
   *
   * @param {string} idA       - First order ID (any order)
   * @param {string} idB       - Second order ID (any order)
   * @param {object} tx        - Active Drizzle transaction (required)
   * @returns {{ a: Order, b: Order }} Locked rows, keyed by original argument name
   */
  async lockOrdersByCanonicalOrder(idA: string, idB: string, tx: any): Promise<{ a: any; b: any }> {
    if (!tx) fail("lockOrdersByCanonicalOrder requires an active transaction", 500);

    // Sort ascending — lower UUID is always locked first, regardless of call order
    const [firstId, secondId] = [idA, idB].sort();

    const first  = await this.findByIdWithLock(firstId,  tx);
    const second = await this.findByIdWithLock(secondId, tx);

    // Return keyed by original argument so callers don't have to re-map
    return {
      a: idA === firstId ? first : second,
      b: idA === firstId ? second : first
    };
  },

  async findByIdempotencyKey(key: string, tx: any = db): Promise<any> {
    if (!key) return null;
    return await tx.query.orders.findFirst({
      where: eq(orders.idempotencyKey, key),
      with: { orderItems: { with: { modifiers: true } } }
    });
  },

  /**
   * ATOMIC CREATE
   * Creates the order root, items, and modifiers in a single transaction.
   */
  async create(orderData: NewOrder, itemsWithModifiers: any[], tx: any = db): Promise<Order> {
    const [newOrder] = await tx.insert(orders).values(orderData).returning();

    for (const item of itemsWithModifiers) {
      const [newItem] = await tx.insert(orderItems).values({
        ...item.data,
        orderId: newOrder.id,
      }).returning();

      if (item.modifiers && item.modifiers.length > 0) {
        await tx.insert(orderItemModifiers).values(
          item.modifiers.map((m: any) => ({
            ...m,
            orderItemId: newItem.id,
          }))
        );
      }
    }

    // Record initial history
    await tx.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      changeType: "LIFECYCLE",
      fromValue: null,
      toValue: orderData.lifecycle,
      actorId: orderData.openedById,
      grandTotalSnapshot: orderData.grandTotal
    });

    return newOrder!;
  },

  /**
   * RECORD STATUS CHANGE
   */
  async recordStatusChange(params: any, tx: any = db): Promise<Order | null> {
    const { orderId, changeType, fromValue, toValue, actorId, reasonCode, notes, grandTotal, currentVersion } = params;

    // Determine whether this changeType touches an orders status column
    const STATUS_CHANGING_TYPES = new Set<string>(["LIFECYCLE", "FULFILLMENT", "PAYMENT"]);

    if (STATUS_CHANGING_TYPES.has(changeType)) {
      // Build the column update payload
      const updatePayload: any = {
        updatedAt: new Date(),
        version: sql`${orders.version} + 1`
      };
      if (changeType === "LIFECYCLE")   updatePayload.lifecycle        = toValue;
      if (changeType === "FULFILLMENT") updatePayload.fulfillmentStatus = toValue;
      if (changeType === "PAYMENT")     updatePayload.paymentStatus    = toValue;

      // Closing/voiding timestamp side-effects
      if (toValue === "COMPLETED") {
        updatePayload.closedAt   = new Date();
        updatePayload.closedById = actorId;
      }
      if (toValue === "VOIDED") {
        updatePayload.voidedAt   = new Date();
        updatePayload.voidedById = actorId;
      }

      // Optimistic lock — currentVersion is mandatory for status-changing types
      if (currentVersion === undefined) {
        fail(`currentVersion is required for ${changeType} status transitions`, 500);
      }
      const whereClause = and(eq(orders.id, orderId), eq(orders.version, currentVersion));

      const [updated] = await tx.update(orders)
        .set(updatePayload)
        .where(whereClause)
        .returning();

      if (!updated) {
        fail("Concurrent modification detected in recordStatusChange", 409);
      }

      // Insert history row then return the updated order row directly —
      // avoids a redundant findById (full join) just to thread the version.
      await tx.insert(orderStatusHistory).values({
        orderId,
        changeType,
        fromValue,
        toValue,
        actorId,
        reasonCode,
        notes,
        grandTotalSnapshot: grandTotal
      });

      return updated!;
    }

    // Audit-only: just insert the history row, return null explicitly.
    await tx.insert(orderStatusHistory).values({
      orderId,
      changeType,
      fromValue,
      toValue,
      actorId,
      reasonCode,
      notes,
      grandTotalSnapshot: grandTotal
    });
    return null;
  },

  /**
   * SAFE UPDATE (Optimistic Locking)
   */
  async update(id: string, data: any, tx: any = db): Promise<Order> {
    const { version: currentVersion, ...updateData } = data;

    if (currentVersion === undefined) {
      fail("Optimistic locking failure: 'version' is required for order updates. Use updateUnsafe() only if explicitly justified.", 500);
    }

    const whereClause = and(eq(orders.id, id), eq(orders.version, currentVersion));

    const [updated] = await tx.update(orders)
      .set({
        ...updateData,
        version: sql`${orders.version} + 1`,
        updatedAt: new Date()
      })
      .where(whereClause)
      .returning();

    if (!updated) {
      fail("Order was modified by another process. Please refresh.", 409);
    }
    return updated!;
  },

  /**
   * UNSAFE UPDATE (Internal Only)
   */
  async updateUnsafe(id: string, data: any, tx: any = db): Promise<Order> {
    const { version, ...updateData } = data;

    const [updated] = await tx.update(orders)
      .set({
        ...updateData,
        version: sql`${orders.version} + 1`,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      fail("Order not found during unsafe update", 404);
    }
    return updated!;
  },

  // --- ITEM MANAGEMENT ---

  async findItemById(itemId: string, tx: any = db): Promise<any> {
    return await tx.query.orderItems.findFirst({
      where: eq(orderItems.id, itemId),
      with: { modifiers: true }
    });
  },

  async addItem(orderId: string, itemData: any, modifiersList: any[], tx: any = db): Promise<OrderItem> {
    const [newItem] = await tx.insert(orderItems).values({
      ...itemData,
      orderId,
    }).returning();

    if (modifiersList && modifiersList.length > 0) {
      await tx.insert(orderItemModifiers).values(
        modifiersList.map(m => ({
          ...m,
          orderItemId: newItem.id,
        }))
      );
    }
    return newItem!;
  },

  async updateItem(itemId: string, data: any, tx: any = db): Promise<OrderItem> {
    const [updated] = await tx.update(orderItems)
      .set(data)
      .where(eq(orderItems.id, itemId))
      .returning();
    return updated!;
  },

  async removeItem(itemId: string, tx: any = db): Promise<OrderItem[]> {
    return await tx.delete(orderItems).where(eq(orderItems.id, itemId)).returning();
  },

  async voidItem(itemId: string, reason: string, actorId: string, tx: any = db): Promise<OrderItem> {
    const [updated] = await tx.update(orderItems)
      .set({ 
        status: "VOIDED", 
        isVoided: true, 
        voidReason: reason,
        voidedAt: new Date(),
        voidedById: actorId
      })
      .where(eq(orderItems.id, itemId))
      .returning();
    return updated!;
  },

  async countCouponUsage(customerId: string | null, couponCode: string, tx: any = db): Promise<number> {
    const conditions: any[] = [
      eq(orders.couponCode, couponCode),
      notInArray(orders.lifecycle, ["VOIDED", "CANCELLED"])
    ];
    if (customerId) conditions.push(eq(orders.customerId, customerId));

    const result = await tx.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(...conditions));
    return Number(result[0]?.count || 0);
  },

  async getActiveItems(orderId: string, tx: any = db): Promise<OrderItem[]> {
    return await tx.query.orderItems.findMany({
      where: and(
        eq(orderItems.orderId, orderId),
        not(eq(orderItems.status, "VOIDED"))
      )
    });
  },

  async countActiveItems(orderId: string, tx: any = db): Promise<number> {
    const result = await tx.select({ count: sql`count(*)` })
      .from(orderItems)
      .where(and(
        eq(orderItems.orderId, orderId),
        not(eq(orderItems.status, "VOIDED"))
      ));
    return Number(result[0]?.count || 0);
  }
};

export default orderRepository;
