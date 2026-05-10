import { eq, desc } from "drizzle-orm";
import { bills } from "./bill.schema.js";
import { db } from "../../config/database.js";

const billRepository = {
  async findAll() {
    return await db.select().from(bills).orderBy(desc(bills.createdAt));
  },

  async findById(id) {
    const result = await db.select().from(bills).where(eq(bills.id, id));
    return result[0];
  },

  async findByOrderId(orderId) {
    const result = await db.select().from(bills).where(eq(bills.orderId, orderId));
    return result[0];
  },

  async create(data) {
    const result = await db.insert(bills).values(data).returning();
    return result[0];
  },

  async update(id, data) {
    const result = await db.update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return result[0];
  },

  async delete(id) {
    return await db.delete(bills).where(eq(bills.id, id)).returning();
  }
};

export default billRepository;
