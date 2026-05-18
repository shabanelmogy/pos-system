import { pgTable, uuid, integer, text, timestamp, decimal, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { orders } from "./order.schema.js";
import { items } from "../item/item.schema.js";

export const itemStatusEnum = pgEnum("item_status", ["PENDING", "PREPARING", "READY", "SERVED", "VOIDED", "CANCELLED"]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id").references(() => items.id),
  
  // Snapshots for Audit
  nameSnapshot: jsonb("name_snapshot").$type<Record<string, string>>().notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  
  status: itemStatusEnum("status").default("PENDING").notNull(),
  notes: text("notes"),
  isVoided: boolean("is_voided").default(false),
  voidReason: text("void_reason"),
  voidedAt: timestamp("voided_at"),
  voidedById: uuid("voided_by_id"),
  
  kitchenStationId: uuid("kitchen_station_id"), // Routing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemModifiers = pgTable("order_item_modifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  modifierId: uuid("modifier_id").notNull(),
  name: jsonb("name").$type<Record<string, string>>().notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).default("0"),
  quantity: integer("quantity").default(1),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderItemModifier = typeof orderItemModifiers.$inferSelect;
export type NewOrderItemModifier = typeof orderItemModifiers.$inferInsert;
