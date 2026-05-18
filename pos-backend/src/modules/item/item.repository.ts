import { eq, sql, inArray } from "drizzle-orm";
import { items, itemModifiers, Item, NewItem, ItemModifier } from "./item.schema.js";
import { categories } from "../category/category.schema.js";
import { db } from "../../config/database.js";

export interface ItemWithKitchenStation {
  id: string;
  name: Record<string, string>;
  price: string;
  categoryId: string;
  kitchenStationId: string | null;
}

const itemRepository = {
  async findAll(): Promise<Item[]> {
    return await db.select().from(items);
  },

  async findByCategoryId(categoryId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.categoryId, categoryId));
  },

  async findById(id: string): Promise<ItemWithKitchenStation | undefined> {
    const result = await db.select({
      id: items.id,
      name: items.name,
      price: items.price,
      categoryId: items.categoryId,
      kitchenStationId: categories.kitchenStationId
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(items.id, id))
    .limit(1);
    return result[0];
  },

  async findByIds(ids: string[]): Promise<ItemWithKitchenStation[]> {
    if (!ids || ids.length === 0) return [];
    return await db.select({
      id: items.id,
      name: items.name,
      price: items.price,
      categoryId: items.categoryId,
      kitchenStationId: categories.kitchenStationId
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(inArray(items.id, ids));
  },

  async create(itemData: NewItem): Promise<Item> {
    const result = await db.insert(items).values(itemData).returning();
    return result[0];
  },

  async update(id: string, itemData: Partial<NewItem>): Promise<Item | undefined> {
    const result = await db.update(items)
      .set({ ...itemData, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return result[0];
  },

  async hasRelations(id: string): Promise<boolean> {
    const result = await db.execute(sql`SELECT 1 FROM order_items WHERE menu_item_id = ${id} LIMIT 1`);
    return result.rows.length > 0;
  },

  async delete(id: string): Promise<Item | undefined> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result[0];
  },

  async findModifierById(id: string): Promise<ItemModifier | undefined> {
    const result = await db.select().from(itemModifiers).where(eq(itemModifiers.id, id)).limit(1);
    return result[0];
  },

  async findModifiersByIds(ids: string[]): Promise<ItemModifier[]> {
    if (!ids || ids.length === 0) return [];
    return await db.select().from(itemModifiers).where(inArray(itemModifiers.id, ids));
  }
};

export default itemRepository;
