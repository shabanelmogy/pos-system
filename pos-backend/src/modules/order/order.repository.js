import { eq, desc, and, sql } from "drizzle-orm";
import { orders } from "./order.schema.js";
import { orderItems } from "./orderItem.schema.js";
import { customers } from "../customer/customer.schema.js";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { shifts } from "../shift/shift.schema.js";
import { db } from "../../config/database.js";

const orderRepository = {
  async findAll(filters = {}) {
    const { branchId, posPointId, shiftId, cashierId, startDate, endDate } = filters;

    const rows = await db
      .select({
        order: orders,
        customer: customers,
        branch: branches,
        posPoint: posPoints,
        shift: shifts,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(branches, eq(orders.branchId, branches.id))
      .leftJoin(posPoints, eq(orders.posPointId, posPoints.id))
      .leftJoin(shifts, eq(orders.shiftId, shifts.id))
      .where(() => {
        const conditions = [];
        if (branchId) conditions.push(eq(orders.branchId, branchId));
        if (posPointId) conditions.push(eq(orders.posPointId, posPointId));
        if (shiftId) conditions.push(eq(orders.shiftId, shiftId));
        if (cashierId) conditions.push(eq(orders.cashierId, cashierId));
        
        if (startDate) {
            conditions.push(sql`${orders.createdAt} >= ${new Date(startDate)}`);
        }
        if (endDate) {
            conditions.push(sql`${orders.createdAt} <= ${new Date(endDate)}`);
        }

        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return and(...conditions);
      })
      .orderBy(desc(orders.createdAt));

    return rows.map(r => ({
      ...r.order,
      customer: r.customer,
      branch: r.branch,
      posPoint: r.posPoint,
      shift: r.shift,
      orderItems: [] // Initially empty, can be fetched if necessary
    }));
  },

  async findById(id) {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    return result[0];
  },

  async create(orderData, items, externalTx = null) {
    const tx = externalTx || db;
    
    // 1. Insert the order
    const [newOrder] = await tx.insert(orders).values(orderData).returning();

    // 2. Insert order items
    const preparedItems = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    if (preparedItems.length > 0) {
      await tx.insert(orderItems).values(preparedItems);
    }

    return {
      ...newOrder,
      orderItems: preparedItems
    };
  },

  async update(id, orderData, externalTx = null) {
    const tx = externalTx || db;
    const result = await tx.update(orders)
      .set({ ...orderData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }
};

export default orderRepository;
