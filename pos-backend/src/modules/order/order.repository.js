import { eq } from "drizzle-orm";
import { orders } from "./order.schema.js";
import { tables } from "../table/table.schema.js";
import { db } from "../../config/database.js";

const orderRepository = {
  async findAll() {
    const rows = await db
      .select({
        order: orders,
        table: tables,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id));
    
    return rows.map(row => ({
      ...row.order,
      table: row.table
    }));
  },

  async findById(id) {
    const result = await db
      .select({
        order: orders,
        table: tables,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    return {
      ...result[0].order,
      table: result[0].table
    };
  },

  async create(orderData) {
    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  },

  async update(id, orderData) {
    const result = await db.update(orders)
      .set({ ...orderData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }
};

export default orderRepository;
