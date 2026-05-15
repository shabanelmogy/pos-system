import { pgTable, uuid, varchar, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { orders } from "../order/order.schema.js";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: varchar("payment_id", { length: 255 }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount"),
  currency: varchar("currency", { length: 10 }),
  status: varchar("status", { length: 50 }),
  method: varchar("method", { length: 50 }),
  isRefunded: boolean("is_refunded").default(false),
  refundId: varchar("refund_id", { length: 255 }),
  email: varchar("email", { length: 255 }),
  contact: varchar("contact", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
