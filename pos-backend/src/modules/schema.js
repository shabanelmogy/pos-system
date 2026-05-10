import { relations } from "drizzle-orm";
import { users, userPosPermissions } from "./user/user.schema.js";
import { tables } from "./table/table.schema.js";
import { orders } from "./order/order.schema.js";
import { orderItems } from "./order/orderItem.schema.js";
import { payments } from "./payment/payment.schema.js";
import { categories } from "./category/category.schema.js";
import { items } from "./item/item.schema.js";
import { customers } from "./customer/customer.schema.js";
import { bills } from "./bill/bill.schema.js";
import { branches } from "./branch/branch.schema.js";
import { posPoints } from "./posPoint/posPoint.schema.js";
import { shifts } from "./shift/shift.schema.js";
import { posSettings } from "./posSettings/posSettings.schema.js";

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
  posPermissions: many(userPosPermissions),
  shifts: many(shifts),
  orders: many(orders),
}));

// User POS Permissions Relations
export const userPosPermissionsRelations = relations(userPosPermissions, ({ one }) => ({
  user: one(users, { fields: [userPosPermissions.userId], references: [users.id] }),
  posPoint: one(posPoints, { fields: [userPosPermissions.posPointId], references: [posPoints.id] }),
}));

// Branches Relations
export const branchesRelations = relations(branches, ({ many }) => ({
  posPoints: many(posPoints),
  shifts: many(shifts),
  orders: many(orders),
  users: many(users),
}));

// POS Points Relations
export const posPointsRelations = relations(posPoints, ({ one, many }) => ({
  branch: one(branches, { fields: [posPoints.branchId], references: [branches.id] }),
  shifts: many(shifts),
  settings: one(posSettings, { fields: [posPoints.id], references: [posSettings.posPointId] }),
  userPermissions: many(userPosPermissions),
}));

// Shifts Relations
export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  branch: one(branches, { fields: [shifts.branchId], references: [branches.id] }),
  posPoint: one(posPoints, { fields: [shifts.posPointId], references: [posPoints.id] }),
  cashier: one(users, { fields: [shifts.cashierId], references: [users.id] }),
  orders: many(orders),
}));

// Orders Relations
export const ordersRelations = relations(orders, ({ many, one }) => ({
  orderItems: many(orderItems),
  table: one(tables, { fields: [orders.tableId], references: [tables.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  bill: one(bills, { fields: [orders.id], references: [bills.orderId] }),
  branch: one(branches, { fields: [orders.branchId], references: [branches.id] }),
  posPoint: one(posPoints, { fields: [orders.posPointId], references: [posPoints.id] }),
  shift: one(shifts, { fields: [orders.shiftId], references: [shifts.id] }),
  cashier: one(users, { fields: [orders.cashierId], references: [users.id] }),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(items, { fields: [orderItems.menuItemId], references: [items.id] }),
}));

// Customers Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

// Bills Relations
export const billsRelations = relations(bills, ({ one }) => ({
  order: one(orders, { fields: [bills.orderId], references: [orders.id] }),
}));

// Tables Relations
export const tablesRelations = relations(tables, ({ many }) => ({
  orders: many(orders),
}));

// Items Relations
export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
  orderItems: many(orderItems),
}));

export {
  users,
  userPosPermissions,
  tables,
  orders,
  orderItems,
  payments,
  categories,
  items,
  customers,
  bills,
  branches,
  posPoints,
  shifts,
  posSettings,
};
