import { eq, sql } from "drizzle-orm";
import { categories, Category, NewCategory } from "./category.schema.js";
import { db } from "../../config/database.js";

const categoryRepository = {
  async findAll(): Promise<Category[]> {
    return await db.select().from(categories);
  },

  async findById(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  },

  async findByName(name: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
    return result[0];
  },

  async create(categoryData: NewCategory): Promise<Category> {
    const result = await db.insert(categories).values(categoryData).returning();
    return result[0];
  },

  async update(id: string, categoryData: Partial<NewCategory>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  },

  async hasItems(id: string): Promise<boolean> {
    const result = await db.execute(sql`SELECT 1 FROM items WHERE category_id = ${id} LIMIT 1`);
    return result.rows.length > 0;
  },

  async delete(id: string): Promise<Category | undefined> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result[0];
  }
};

export default categoryRepository;
