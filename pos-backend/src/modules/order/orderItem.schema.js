import { pgTable, uuid, integer, numeric, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { orders } from "./order.schema.js";
import { items } from "../item/item.schema.js";

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id").references(() => items.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  itemSnapshot: jsonb("item_snapshot").notNull(), // Historical snapshot
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
