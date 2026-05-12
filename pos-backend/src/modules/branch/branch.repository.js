import { eq } from "drizzle-orm";
import { branches } from "./branch.schema.js";
import { db } from "../../config/database.js";

const branchRepository = {
  async findAll() {
    return await db.select().from(branches);
  },
  async create(data) {
    const result = await db.insert(branches).values(data).returning();
    return result[0];
  },
  async findById(id) {
    const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    return result[0];
  },
  async update(id, data) {
    const result = await db.update(branches).set(data).where(eq(branches.id, id)).returning();
    return result[0];
  },
  async delete(id) {
    return await db.delete(branches).where(eq(branches.id, id));
  }
};

export default branchRepository;
