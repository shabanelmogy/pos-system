import { pgTable, uuid, varchar, timestamp, numeric, text, jsonb } from "drizzle-orm/pg-core";
import { tables } from "../table/table.schema.js";
import { customers } from "../customer/customer.schema.js";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { shifts } from "../shift/shift.schema.js";
import { users } from "../user/user.schema.js";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").references(() => branches.id),
  posPointId: uuid("pos_point_id").references(() => posPoints.id),
  shiftId: uuid("shift_id").references(() => shifts.id),
  cashierId: uuid("cashier_id").references(() => users.id),
  customerId: uuid("customer_id").references(() => customers.id),
  tableId: uuid("table_id").references(() => tables.id),
  
  orderStatus: varchar("order_status", { length: 50 }).notNull(),
  
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
  tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0.00"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0.00"),
  
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("Pending"),
  paymentData: jsonb("payment_data"),
  notes: text("notes"),
  
  customerSnapshot: jsonb("customer_snapshot"), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
