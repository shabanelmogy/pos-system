import { eq, sql, ilike } from "drizzle-orm";
import { categories } from "./category.schema.js";
import { db } from "../../config/database.js";

const categoryRepository = {
  async findAll() {
    return await db.select().from(categories);
  },

  async search(query) {
    return await db.select()
      .from(categories)
      .where(ilike(categories.name, `%${query}%`))
      .limit(20);
  },

  async findById(id) {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  },

  async findByName(name) {
    const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
    return result[0];
  },

  async create(categoryData) {
    const result = await db.insert(categories).values(categoryData).returning();
    return result[0];
  },

  async update(id, categoryData) {
    const result = await db.update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  },

  async hasItems(id) {
    const result = await db.execute(sql`SELECT 1 FROM items WHERE category_id = ${id} LIMIT 1`);
    return result.rows.length > 0;
  },

  async delete(id) {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result[0];
  }
};

export default categoryRepository;
