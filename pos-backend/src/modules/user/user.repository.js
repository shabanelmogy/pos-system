import { eq } from "drizzle-orm";
import { users } from "./user.schema.js";
import { db } from "../../config/database.js";

const userRepository = {
  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  },

  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },

  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  async update(id, userData) {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
};

export default userRepository;
