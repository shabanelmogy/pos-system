import { eq, desc } from "drizzle-orm";
import { bills, Bill, NewBill } from "./bill.schema.js";
import { db } from "../../../config/database.js";

const billRepository = {
  async findAll(): Promise<Bill[]> {
    return await db.select().from(bills).orderBy(desc(bills.createdAt));
  },

  async findById(id: string): Promise<Bill | undefined> {
    const result = await db.select().from(bills).where(eq(bills.id, id));
    return result[0];
  },

  async findByOrderId(orderId: string, externalTx: any = null): Promise<Bill | undefined> {
    const tx = externalTx || db;
    const result = await tx.select().from(bills).where(eq(bills.orderId, orderId));
    return result[0];
  },

  async create(data: NewBill, externalTx: any = null): Promise<Bill> {
    const tx = externalTx || db;
    const result = await tx.insert(bills).values(data).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewBill>, externalTx: any = null): Promise<Bill | undefined> {
    const tx = externalTx || db;
    const result = await tx.update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return result[0];
  },

  async delete(id: string, externalTx: any = null): Promise<Bill[]> {
    const tx = externalTx || db;
    return await tx.delete(bills).where(eq(bills.id, id)).returning();
  }
};

export default billRepository;
