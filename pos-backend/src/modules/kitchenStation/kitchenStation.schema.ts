import { pgTable, uuid, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const kitchenStations = pgTable("kitchen_stations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").$type<Record<string, string>>().notNull(),
  branchId: uuid("branch_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type KitchenStation = typeof kitchenStations.$inferSelect;
export type NewKitchenStation = typeof kitchenStations.$inferInsert;
