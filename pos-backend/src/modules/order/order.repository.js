import { eq, desc } from "drizzle-orm";
import { orders } from "./order.schema.js";
import { orderItems } from "./orderItem.schema.js";
import { db } from "../../config/database.js";

const orderRepository = {
  async findAll(filters = {}) {
    const { branchId, posPointId, shiftId, cashierId, startDate, endDate } = filters;

    return await db.query.orders.findMany({
      where: (fields, { eq, and, gte, lte }) => {
        const conditions = [];
        if (branchId) conditions.push(eq(fields.branchId, branchId));
        if (posPointId) conditions.push(eq(fields.posPointId, posPointId));
        if (shiftId) conditions.push(eq(fields.shiftId, shiftId));
        if (cashierId) conditions.push(eq(fields.cashierId, cashierId));
        
        if (startDate) {
            conditions.push(gte(fields.createdAt, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(fields.createdAt, new Date(endDate)));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        orderItems: {
            with: { menuItem: true }
        },
        customer: true,
        branch: true,
        posPoint: true,
        shift: true,
      },
      orderBy: [desc(orders.createdAt)],
    });
  },

  async findById(id) {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: true,
        table: true,
        customer: true,
        branch: true,
        posPoint: true,
        shift: true,
      },
    });
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
