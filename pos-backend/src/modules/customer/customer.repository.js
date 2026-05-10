import { eq, sql } from "drizzle-orm";
import { customers } from "./customer.schema.js";
import { db } from "../../config/database.js";

const customerRepository = {
  async findAll() {
    return await db.select().from(customers);
  },

  async findById(id) {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  },

  async findByPhone(phone) {
    const result = await db.select().from(customers).where(eq(customers.phone, phone));
    return result[0];
  },

  async create(data, externalTx = null) {
    const tx = externalTx || db;
    const result = await tx.insert(customers).values(data).returning();
    return result[0];
  },

  async update(id, data, externalTx = null) {
    const tx = externalTx || db;
    const result = await tx.update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  },

  async updateStats(id, amount, externalTx = null) {
    const tx = externalTx || db;
    return await tx.update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${amount}`,
        lastOrderAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();
  }
};

export default customerRepository;
