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
    const updateObj = { updatedAt: new Date() };
    if (tableData.tableNo !== undefined) updateObj.tableNo = tableData.tableNo;
    if (tableData.seats !== undefined) updateObj.seats = tableData.seats;
    if (tableData.status !== undefined) updateObj.status = tableData.status;
    if (tableData.currentOrderId !== undefined) updateObj.currentOrderId = tableData.currentOrderId;

    console.log(`[DEBUG] Repository Update - ID: ${id}, UpdateObj:`, updateObj);
    const result = await db.update(tables)
      .set(updateObj)
      .where(eq(tables.id, id))
      .returning();
    
    console.log(`[DEBUG] Repository Result:`, result[0]);
    return result[0];
  },

  async delete(id) {
    const result = await db.delete(tables).where(eq(tables.id, id)).returning();
    return result[0];
  }
};

export default tableRepository;
