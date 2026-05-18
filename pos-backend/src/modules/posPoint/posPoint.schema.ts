import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { branches } from "../branch/branch.schema.js";

export const posPoints = pgTable("pos_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(), // e.g., 'Counter 1', 'Kitchen Tablet'
  code: text("code").notNull().unique(), // e.g., 'POS-BR1-01'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PosPoint = typeof posPoints.$inferSelect;
export type NewPosPoint = typeof posPoints.$inferInsert;
