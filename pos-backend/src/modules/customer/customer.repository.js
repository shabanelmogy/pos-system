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

  async create(data) {
    const result = await db.insert(customers).values(data).returning();
    return result[0];
  },

  async update(id, data) {
    const result = await db.update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  },

  async updateStats(id, amount) {
    return await db.update(customers)
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
