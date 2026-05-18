import { eq, sql } from "drizzle-orm";
import { customers, Customer, NewCustomer } from "./customer.schema.js";
import { db } from "../../config/database.js";

const customerRepository = {
  async findAll(): Promise<Customer[]> {
    return await db.select().from(customers);
  },

  async findById(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  },

  async findByPhone(phone: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.phone, phone));
    return result[0];
  },

  async create(data: NewCustomer, externalTx: any = null): Promise<Customer> {
    const tx = externalTx || db;
    const result = await tx.insert(customers).values(data).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewCustomer>, externalTx: any = null): Promise<Customer | undefined> {
    const tx = externalTx || db;
    const result = await tx.update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  },

  async updateStats(id: string, amount: string | number, externalTx: any = null): Promise<Customer[]> {
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
