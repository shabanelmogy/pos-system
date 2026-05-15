import { db } from "../../config/database.js";
import { orders, orderStatusHistory } from "./order.schema.js";
import { orderItems, orderItemModifiers } from "./orderItem.schema.js";
import { eq, desc, and, sql, not, notInArray } from "drizzle-orm";
import { fail } from "../../utils/errorHandler.js";

const orderRepository = {
  async findAll(filters = {}) {
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
      customerId
    } = filters;
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const whereClauses = [];
    if (branchId) whereClauses.push(eq(orders.branchId, branchId));
    if (lifecycle) whereClauses.push(eq(orders.lifecycle, lifecycle));
    if (fulfillmentStatus) whereClauses.push(eq(orders.fulfillmentStatus, fulfillmentStatus));
    if (paymentStatus) whereClauses.push(eq(orders.paymentStatus, paymentStatus));
    if (type) whereClauses.push(eq(orders.orderType, type));
    if (tableId) whereClauses.push(eq(orders.tableId, tableId));
    if (shiftId) whereClauses.push(eq(orders.shiftId, shiftId));
    if (customerId) whereClauses.push(eq(orders.customerId, customerId));

    const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    // 1. Get total count for metadata
    const [countResult] = await db.select({ count: sql`count(*)` }).from(orders).where(where);
    const total = Number(countResult.count);

    // 2. Get paginated results
    const results = await db.query.orders.findMany({
      where,
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
    });

    return {
      orders: results,
      pagination: {
        total,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      },
      slim: true // Explicitly indicate that orders do not include items
    };
  },

  async findById(id, tx = db) {
    return await tx.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: {
          with: {
            modifiers: true,
          }
        }
      }
    });
  },

  async findByIdWithLock(id, tx = db) {
    const [order] = await tx.select().from(orders).where(eq(orders.id, id)).forUpdate();
    return order || null;
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
   * Why this prevents deadlocks:
   *   If transaction A locks order-1 then order-2, and transaction B locks
   *   order-2 then order-1 concurrently, they deadlock. Forcing both to always
   *   lock the lower UUID first means they can never wait on each other.
   *
   *   UUID lexicographic sort is stable and consistent — it doesn't depend on
   *   which argument is "source" vs "target", so callers can't accidentally
   *   pass them in the wrong order.
   *
   * @param {string} idA       - First order ID (any order)
   * @param {string} idB       - Second order ID (any order)
   * @param {object} tx        - Active Drizzle transaction (required)
   * @returns {{ a: order, b: order }} Locked rows, keyed by original argument name
   *
   * Usage:
   *   const { a: source, b: target } =
   *     await orderRepository.lockOrdersByCanonicalOrder(sourceId, targetId, tx);
   */
  async lockOrdersByCanonicalOrder(idA, idB, tx) {
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

  async findByIdempotencyKey(key, tx = db) {
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
  async create(orderData, itemsWithModifiers, tx = db) {
    const [newOrder] = await tx.insert(orders).values(orderData).returning();

    for (const item of itemsWithModifiers) {
      const [newItem] = await tx.insert(orderItems).values({
        ...item.data,
        orderId: newOrder.id,
      }).returning();

      if (item.modifiers && item.modifiers.length > 0) {
        await tx.insert(orderItemModifiers).values(
          item.modifiers.map(m => ({
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

    return newOrder;
  },

  /**
   * RECORD STATUS CHANGE
   *
   * Two distinct behaviours based on changeType:
   *
   * STATUS-CHANGING types (LIFECYCLE | FULFILLMENT | PAYMENT)
   *   → UPDATE the orders row (set status column + version+1 + timestamps)
   *   → INSERT history row
   *   → Requires currentVersion for optimistic lock
   *
   * AUDIT-ONLY types (ITEM_VOID | TABLE_MOVE | ...)
   *   → Only INSERT history row — skip the orders UPDATE entirely
   *   → The preceding repository call (voidItem / updateItem) already holds
   *     the row lock and advanced updatedAt/version correctly
   *   → A blind version bump here would be a silent unguarded concurrent write
   */
  async recordStatusChange(params, tx = db) {
    const { orderId, changeType, fromValue, toValue, actorId, reasonCode, notes, grandTotal, currentVersion } = params;

    // Determine whether this changeType touches an orders status column
    const STATUS_CHANGING_TYPES = new Set(["LIFECYCLE", "FULFILLMENT", "PAYMENT"]);

    if (STATUS_CHANGING_TYPES.has(changeType)) {
      // Build the column update payload
      const updatePayload = {
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

      return updated;
    }

    // Audit-only: just insert the history row, return null explicitly.
    // STATUS-CHANGING types return the updated order row; audit-only types return null.
    // Callers must not rely on the return value of audit-only recordStatusChange calls.
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
   * 
   * Enforces that the caller provides the 'version' of the order they 
   * intend to update. If the database version has changed since the caller
   * last read the row, the update will fail, preventing lost updates.
   */
  async update(id, data, tx = db) {
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
    return updated;
  },

  /**
   * UNSAFE UPDATE (Internal Only)
   * 
   * Bypasses optimistic locking. Use only for internal system-level updates
   * where the risk of concurrent collision is handled via other means (e.g. 
   * row-level locking 'FOR UPDATE' earlier in the transaction).
   */
  async updateUnsafe(id, data, tx = db) {
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
    return updated;
  },

  // --- ITEM MANAGEMENT ---

  async findItemById(itemId, tx = db) {
    return await tx.query.orderItems.findFirst({
      where: eq(orderItems.id, itemId),
      with: { modifiers: true }
    });
  },

  async addItem(orderId, itemData, modifiersList, tx = db) {
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
    return newItem;
  },

  async updateItem(itemId, data, tx = db) {
    const [updated] = await tx.update(orderItems)
      .set(data)
      .where(eq(orderItems.id, itemId))
      .returning();
    return updated;
  },

  async removeItem(itemId, tx = db) {
    return await tx.delete(orderItems).where(eq(orderItems.id, itemId)).returning();
  },

  async voidItem(itemId, reason, actorId, tx = db) {
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
    return updated;
  },

  async countCouponUsage(customerId, couponCode, tx = db) {
    const conditions = [
      eq(orders.couponCode, couponCode),
      notInArray(orders.lifecycle, ["VOIDED", "CANCELLED"])
    ];
    if (customerId) conditions.push(eq(orders.customerId, customerId));

    const result = await tx.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(...conditions));
    return Number(result[0].count);
  },

  async getActiveItems(orderId, tx = db) {
    return await tx.query.orderItems.findMany({
      where: and(
        eq(orderItems.orderId, orderId),
        not(eq(orderItems.status, "VOIDED"))
      )
    });
  },

  async countActiveItems(orderId, tx = db) {
    const result = await tx.select({ count: sql`count(*)` })
      .from(orderItems)
      .where(and(
        eq(orderItems.orderId, orderId),
        not(eq(orderItems.status, "VOIDED"))
      ));
    return Number(result[0].count);
  }
};

export default orderRepository;
