import { pgTable, uuid, varchar, text, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { categories } from "../category/category.schema.js";

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  images: jsonb("images").notNull().default([]),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemModifiers = pgTable("item_modifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type ItemModifier = typeof itemModifiers.$inferSelect;
export type NewItemModifier = typeof itemModifiers.$inferInsert;
