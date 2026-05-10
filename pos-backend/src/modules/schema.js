import { relations } from "drizzle-orm";
import { users } from "./user/user.schema.js";
import { tables } from "./table/table.schema.js";
import { orders } from "./order/order.schema.js";
import { orderItems } from "./order/orderItem.schema.js";
import { payments } from "./payment/payment.schema.js";
import { categories } from "./category/category.schema.js";
import { items } from "./item/item.schema.js";
import { customers } from "./customer/customer.schema.js";
import { bills } from "./bill/bill.schema.js";

// Define Relations
export const ordersRelations = relations(orders, ({ many, one }) => ({
  orderItems: many(orderItems),
  table: one(tables, { fields: [orders.tableId], references: [tables.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  bill: one(bills, { fields: [orders.id], references: [bills.orderId] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(items, { fields: [orderItems.menuItemId], references: [items.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  order: one(orders, { fields: [bills.orderId], references: [orders.id] }),
}));

export const tablesRelations = relations(tables, ({ many }) => ({
  orders: many(orders),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
  orderItems: many(orderItems),
}));

export {
  users,
  tables,
  orders,
  orderItems,
  payments,
  categories,
  items,
  customers,
  bills,
};
