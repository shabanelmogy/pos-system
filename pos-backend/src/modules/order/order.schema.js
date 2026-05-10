import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerDetails: jsonb("customer_details").notNull(),
  orderStatus: varchar("order_status", { length: 50 }).notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  bills: jsonb("bills").notNull(),
  items: jsonb("items").notNull().default([]),
  tableId: uuid("table_id"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentData: jsonb("payment_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
