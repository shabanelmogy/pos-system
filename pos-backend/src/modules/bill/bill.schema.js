import { pgTable, uuid, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { orders } from "../order/order.schema.js";

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  billNo: varchar("bill_no", { length: 50 }).notNull().unique(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
  payableAmount: numeric("payable_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("Unpaid"), // Paid, Partially Paid, Unpaid
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
