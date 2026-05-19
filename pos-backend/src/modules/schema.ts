import { relations } from "drizzle-orm";
import { users, userPosPermissions } from "./user/user.schema.js";
import { tables } from "./table/table.schema.js";
import { orders, orderLifecycleEnum, fulfillmentStatusEnum, paymentStatusEnum, orderTypeEnum, orderStatusHistory } from "./order/order.schema.js";
import { orderItems, itemStatusEnum } from "./order/orderItem.schema.js";
import { payments } from "./payment/payment.schema.js";
import { categories } from "./category/category.schema.js";
import { items, itemModifiers } from "./item/item.schema.js";
import { customers } from "./customer/customer.schema.js";
import { bills } from "./bill/bill.schema.js";
import { branches } from "./branch/branch.schema.js";
import { posPoints } from "./posPoint/posPoint.schema.js";
import { shifts } from "./shift/shift.schema.js";
import { posSettings } from "./posSettings/posSettings.schema.js";
import { coupons, couponTypeEnum } from "./coupon/coupon.schema.js";
import { kitchenStations } from "./kitchenStation/kitchenStation.schema.js";
import { orderSequences } from "./order/orderSequence.schema.js";
import { orderItemModifiers } from "./order/orderItem.schema.js";

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
  openedBy: one(users, { fields: [orders.openedById], references: [users.id] }),
  waiter: one(users, { fields: [orders.waiterId], references: [users.id] }),
  closedBy: one(users, { fields: [orders.closedById], references: [users.id] }),
  voidedBy: one(users, { fields: [orders.voidedById], references: [users.id] }),
  statusHistory: many(orderStatusHistory),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(items, { fields: [orderItems.menuItemId], references: [items.id] }),
  modifiers: many(orderItemModifiers),
}));

export const orderItemModifiersRelations = relations(orderItemModifiers, ({ one }) => ({
  orderItem: one(orderItems, { fields: [orderItemModifiers.orderItemId], references: [orderItems.id] }),
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
  modifiers: many(itemModifiers),
}));

export const itemModifiersRelations = relations(itemModifiers, ({ one }) => ({
  item: one(items, { fields: [itemModifiers.itemId], references: [items.id] }),
}));

// Kitchen Stations Relations
export const kitchenStationsRelations = relations(kitchenStations, ({ one, many }) => ({
  branch: one(branches, { fields: [kitchenStations.branchId], references: [branches.id] }),
  categories: many(categories),
}));

// Categories Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  kitchenStation: one(kitchenStations, { fields: [categories.kitchenStationId], references: [kitchenStations.id] }),
  items: many(items),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "subcategories" }),
  children: many(categories, { relationName: "subcategories" }),
}));

// Payments Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

// Order Status History Relations
export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
  actor: one(users, { fields: [orderStatusHistory.actorId], references: [users.id] }),
}));

// Order Sequences Relations
export const orderSequencesRelations = relations(orderSequences, ({ one }) => ({
  branch: one(branches, { fields: [orderSequences.branchId], references: [branches.id] }),
}));

export {
  users,
  userPosPermissions,
  tables,
  orders,
  orderLifecycleEnum,
  fulfillmentStatusEnum,
  paymentStatusEnum,
  orderTypeEnum,
  orderItems,
  itemStatusEnum,
  payments,
  categories,
  items,
  itemModifiers,
  customers,
  bills,
  branches,
  posPoints,
  shifts,
  posSettings,
  coupons,
  couponTypeEnum,
  kitchenStations,
  orderSequences,
  orderStatusHistory,
  orderItemModifiers
};
