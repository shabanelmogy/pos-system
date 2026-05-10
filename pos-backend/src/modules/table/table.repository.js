import { eq } from "drizzle-orm";
import { tables } from "./table.schema.js";
import { orders } from "../order/order.schema.js";
import { db } from "../../config/database.js";

const tableRepository = {
  async findAll() {
    const rows = await db
      .select({
        table: tables,
        order: orders,
      })
      .from(tables)
      .leftJoin(orders, eq(tables.currentOrderId, orders.id));
    
    // Transform rows to match the "populated" structure
    return rows.map(row => ({
      ...row.table,
      currentOrder: row.order
    }));
  },

  async findById(id) {
    const result = await db
      .select({
        table: tables,
        order: orders,
      })
      .from(tables)
      .leftJoin(orders, eq(tables.currentOrderId, orders.id))
      .where(eq(tables.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    return {
      ...result[0].table,
      currentOrder: result[0].order
    };
  },

  async findByTableNo(tableNo) {
    const result = await db.select().from(tables).where(eq(tables.tableNo, tableNo)).limit(1);
    return result[0];
  },

  async create(tableData) {
    const result = await db.insert(tables).values(tableData).returning();
    return result[0];
  },

  async update(id, tableData) {
    const result = await db.update(tables)
      .set({ ...tableData, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return result[0];
  },

  async delete(id) {
    const result = await db.delete(tables).where(eq(tables.id, id)).returning();
    return result[0];
  }
};

export default tableRepository;
