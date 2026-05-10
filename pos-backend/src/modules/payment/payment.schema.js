import { pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: varchar("payment_id", { length: 255 }),
  orderId: varchar("order_id", { length: 255 }),
  amount: numeric("amount"),
  currency: varchar("currency", { length: 10 }),
  status: varchar("status", { length: 50 }),
  method: varchar("method", { length: 50 }),
  email: varchar("email", { length: 255 }),
  contact: varchar("contact", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
