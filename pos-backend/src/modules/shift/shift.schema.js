import { pgTable, text, uuid, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { users } from "../user/user.schema.js";

export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  posPointId: uuid("pos_point_id").references(() => posPoints.id).notNull(),
  cashierId: uuid("cashier_id").references(() => users.id).notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  closingBalance: numeric("closing_balance", { precision: 12, scale: 2 }), // Actual balance entered by cashier
  expectedBalance: numeric("expected_balance", { precision: 12, scale: 2 }), // System calculated (Opening + Sales)
  totalSales: numeric("total_sales", { precision: 12, scale: 2 }).default("0"),
  cashSales: numeric("cash_sales", { precision: 12, scale: 2 }).default("0"),
  cardSales: numeric("card_sales", { precision: 12, scale: 2 }).default("0"),
  variance: numeric("variance", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  status: text("status").default("open").notNull(), // open, closed, suspended
  createdAt: timestamp("created_at").defaultNow(),
});
