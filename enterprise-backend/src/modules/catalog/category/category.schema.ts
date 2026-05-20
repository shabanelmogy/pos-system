import { pgTable, uuid, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").$type<Record<string, string>>().notNull(),
  images: jsonb("images").notNull().default([]),
  parentId: uuid("parent_id"), // Self-referencing: null = root category
  kitchenStationId: uuid("kitchen_station_id"), // Routing for KDS
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: uniqueIndex("categories_name_idx").on(sql`(name->>'en')`),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
