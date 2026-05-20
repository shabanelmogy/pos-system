import { eq, sql } from "drizzle-orm";
import { tables, Table, NewTable } from "./table.schema.js";
import { orders } from "../../pos/order/order.schema.js";
import { db } from "../../../config/database.js";
import orderEventEmitter from "../../../utils/events.js";

export interface TableWithOrder extends Table {
  currentOrder: any | null;
}

const tableRepository = {
  async findAll(): Promise<TableWithOrder[]> {
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

  async findById(id: string, externalTx: any = null): Promise<TableWithOrder | null> {
    const tx = externalTx || db;
    const result = await tx
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

  async findByIdWithLock(id: string, tx: any = db): Promise<TableWithOrder | null> {
    await tx.execute(sql`SELECT 1 FROM tables WHERE id = ${id} FOR UPDATE`);
    return await this.findById(id, tx);
  },

  async findByTableNo(tableNo: number): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.tableNo, tableNo)).limit(1);
    return result[0];
  },

  async create(tableData: NewTable): Promise<Table> {
    const result = await db.insert(tables).values(tableData).returning();
    return result[0];
  },

  async update(id: string, tableData: Partial<NewTable>, externalTx: any = null): Promise<Table | undefined> {
    const tx = externalTx || db;
    const updateObj: any = { updatedAt: new Date() };
    if (tableData.tableNo !== undefined) updateObj.tableNo = tableData.tableNo;
    if (tableData.seats !== undefined) updateObj.seats = tableData.seats;
    if (tableData.status !== undefined) updateObj.status = tableData.status;
    if (tableData.currentOrderId !== undefined) updateObj.currentOrderId = tableData.currentOrderId;

    const result = await tx.update(tables)
      .set(updateObj)
      .where(eq(tables.id, id))
      .returning();
    const updated = result[0];

    // Defer the socket emit to AFTER the transaction commits.
    setImmediate(() => {
      orderEventEmitter.emit("table_updated", { table: updated, branchId: null });
    });

    return updated;
  },

  async delete(id: string): Promise<Table | undefined> {
    const result = await db.delete(tables).where(eq(tables.id, id)).returning();
    return result[0];
  }
};

export default tableRepository;
