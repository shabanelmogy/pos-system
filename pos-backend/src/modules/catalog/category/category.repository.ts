import { eq, sql, isNull, asc } from "drizzle-orm";
import { categories, Category, NewCategory } from "./category.schema.js";
import { items, Item } from "../../catalog/item/item.schema.js";
import { db } from "../../../config/database.js";

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  itemCount?: number;
  items?: Item[];
}

const categoryRepository = {
  async findAll(): Promise<Category[]> {
    return await db.select().from(categories);
  },

  async findById(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  },

  async findByName(nameEn: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(sql`${categories.name}->>'en' = ${nameEn}`).limit(1);
    return result[0];
  },

  /**
   * Returns all categories as a nested tree.
   * Each node includes an `itemCount` and its list of actual `items`.
   */
  async findTree(): Promise<CategoryTreeNode[]> {
    // Fetch all categories
    const allCategories = await db.select().from(categories);

    // Fetch all items sorted by createdAt to group them by categoryId
    const allItems = await db.select().from(items).orderBy(asc(items.createdAt));
    const itemsByCategoryId: Record<string, Item[]> = {};
    for (const item of allItems) {
      if (!itemsByCategoryId[item.categoryId]) {
        itemsByCategoryId[item.categoryId] = [];
      }
      itemsByCategoryId[item.categoryId].push(item);
    }

    // Fetch item counts per category in one shot
    const countRows = await db.execute<{ category_id: string; count: string }>(
      sql`SELECT category_id, COUNT(*) as count FROM items GROUP BY category_id`
    );
    const itemCountMap: Record<string, number> = {};
    for (const row of countRows.rows) {
      itemCountMap[row.category_id] = Number(row.count);
    }

    // Build id → node map
    const nodeMap: Record<string, CategoryTreeNode> = {};
    for (const cat of allCategories) {
      nodeMap[cat.id] = {
        ...cat,
        children: [],
        itemCount: itemCountMap[cat.id] ?? 0,
        items: itemsByCategoryId[cat.id] ?? [],
      };
    }

    // Nest children under parents
    const roots: CategoryTreeNode[] = [];
    for (const node of Object.values(nodeMap)) {
      if (node.parentId && nodeMap[node.parentId]) {
        nodeMap[node.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
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

  async hasChildren(id: string): Promise<boolean> {
    const result = await db.select().from(categories).where(eq(categories.parentId, id)).limit(1);
    return result.length > 0;
  },

  async delete(id: string): Promise<Category | undefined> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result[0];
  }
};

export default categoryRepository;
