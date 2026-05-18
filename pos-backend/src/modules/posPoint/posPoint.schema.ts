import { pgTable, text, uuid, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { branches } from "../branch/branch.schema.js";

export const posPoints = pgTable("pos_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  name: jsonb("name").$type<Record<string, string>>().notNull(), // e.g., {"en": "Counter 1", "ar": "كاونتر 1"}
  code: text("code").notNull().unique(), // e.g., 'POS-BR1-01'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PosPoint = typeof posPoints.$inferSelect;
export type NewPosPoint = typeof posPoints.$inferInsert;
