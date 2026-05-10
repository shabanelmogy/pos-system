import { pgTable, uuid, varchar, timestamp, numeric, text, jsonb } from "drizzle-orm/pg-core";
import { tables } from "../table/table.schema.js";
import { customers } from "../customer/customer.schema.js";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id), // Now links to customers module
  tableId: uuid("table_id").references(() => tables.id),
  orderStatus: varchar("order_status", { length: 50 }).notNull(),
  
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0.00"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentData: jsonb("payment_data"),
  notes: text("notes"),
  
  customerSnapshot: jsonb("customer_snapshot"), // Keeping for guests/historical context
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
