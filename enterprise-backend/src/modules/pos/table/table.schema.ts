import { pgTable, uuid, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const tables = pgTable("tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableNo: integer("table_no").notNull().unique(),
  status: varchar("status", { length: 50 }).default("Available").notNull(),
  seats: integer("seats").notNull(),
  currentOrderId: uuid("current_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
