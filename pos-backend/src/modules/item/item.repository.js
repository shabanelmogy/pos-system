import { eq, sql, ilike } from "drizzle-orm";
import { items } from "./item.schema.js";
import { configAssignments } from "../config/config.schema.js";
import { db } from "../../config/database.js";

const itemRepository = {
  async findAll() {
    return await db.select({
      id: items.id,
      name: items.name,
      price: items.price,
      categoryId: items.categoryId,
      description: items.description,
      configProfileId: configAssignments.profileId,
    })
    .from(items)
    .leftJoin(configAssignments, eq(items.id, configAssignments.targetId));
  },

  async findByCategoryId(categoryId) {
    return await db.select({
      id: items.id,
      name: items.name,
      price: items.price,
      categoryId: items.categoryId,
      description: items.description,
      configProfileId: configAssignments.profileId,
    })
    .from(items)
    .leftJoin(configAssignments, eq(items.id, configAssignments.targetId))
    .where(eq(items.categoryId, categoryId));
  },

  async search(query) {
    return await db.select()
      .from(items)
      .where(ilike(items.name, `%${query}%`))
      .limit(20);
  },

  async findByCategoryId(categoryId) {
    return await db.select().from(items).where(eq(items.categoryId, categoryId));
  },

  async findById(id) {
    const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return result[0];
  },

  async create(itemData) {
    const result = await db.insert(items).values(itemData).returning();
    return result[0];
  },

  async update(id, itemData) {
    const result = await db.update(items)
      .set({ ...itemData, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return result[0];
  },

  async hasRelations(id) {
    const result = await db.execute(sql`SELECT 1 FROM order_items WHERE menu_item_id = ${id} LIMIT 1`);
    return result.rows.length > 0;
  },

  async delete(id) {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result[0];
  }
};

export default itemRepository;
