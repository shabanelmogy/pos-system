import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, pgEnum, check, index } from "drizzle-orm/pg-core";
import { branches } from "../../system/branch/branch.schema.js";
import { users } from "../../system/user/user.schema.js";
import { tables } from "../table/table.schema.js";
import { customers } from "../../crm/customer/customer.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { shifts } from "../shift/shift.schema.js";
import { sql } from "drizzle-orm";

// --- ENUMS: Triple-State Architecture ---

// 1. Order Lifecycle (The "Container" state)
export const orderLifecycleEnum = pgEnum("order_lifecycle", [
  "DRAFT",     // Staged order, not yet sent to production
  "ACTIVE",    // Order is currently open (being modified/served)
  "COMPLETED", // Successfully closed and paid
  "VOIDED",    // Erroneous entry, financial impact negated
  "CANCELLED"  // Legitimate order that was stopped (waste/loss tracking)
]);

// 2. Fulfillment Status (The "Kitchen/Service" state)
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "PENDING",         // Order received, not yet in kitchen
  "PREPARING",       // In production
  "PARTIALLY_READY", // Some items ready
  "READY",           // All items at the pass
  "SERVED",          // (Dine-in) Delivered to table
  "DISPATCHED",      // (Delivery) Out with driver
  "DELIVERED",       // (Delivery) Handed to customer
  "PICKED_UP"        // (Takeaway) Handed to customer
]);

// 3. Payment Status (The "Financial" state)
export const paymentStatusEnum = pgEnum("payment_status", [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "REFUNDED"
]);

// 4. Order Type (Discriminator)
export const orderTypeEnum = pgEnum("order_type", [
  "DINE_IN",
  "TAKE_AWAY",
  "DELIVERY",
  "QR_SELF",
  "PHONE"
]);

// --- MAIN ORDERS TABLE ---

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Multi-Tenant / Branch Context
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  posPointId: uuid("pos_point_id").references(() => posPoints.id).notNull(),
  shiftId: uuid("shift_id").references(() => shifts.id).notNull(),

  // Scoped Identity
  // Format: {BranchCode}-{DailySequence} (e.g., BR1-20231027-0042)
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),

  // Prevent duplicate submissions (Bug 10 Resilience)
  idempotencyKey: varchar("idempotency_key", { length: 100 }).unique(),

  // State Machine Dimensionality
  lifecycle: orderLifecycleEnum("lifecycle").default("DRAFT").notNull(),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status").default("PENDING").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("UNPAID").notNull(),
  orderType: orderTypeEnum("type").default("DINE_IN").notNull(),

  // Actor Context (Audit compliance)
  openedById: uuid("opened_by_id").references(() => users.id).notNull(), // The creator
  waiterId: uuid("waiter_id").references(() => users.id),               // Assigned waiter
  closedById: uuid("closed_by_id").references(() => users.id),           // Who finalized payment
  voidedById: uuid("voided_by_id").references(() => users.id),           // Manager who voided

  // Physical Context
  tableId: uuid("table_id").references(() => tables.id),
  customerId: uuid("customer_id").references(() => customers.id),
  guestCount: integer("guest_count").default(1).notNull(),

  // Financial Summary (Snapshotted for Audit)
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  taxTotal: decimal("tax_total", { precision: 12, scale: 2 }).default("0").notNull(),
  discountTotal: decimal("discount_total", { precision: 12, scale: 2 }).default("0").notNull(),
  serviceCharge: decimal("service_charge", { precision: 12, scale: 2 }).default("0").notNull(),
  grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).default("0").notNull(),

  // Financial Tracking
  couponCode: varchar("coupon_code", { length: 50 }),
  totalPaid: decimal("total_paid", { precision: 12, scale: 2 }).default("0").notNull(),

  // Extensibility & Enterprise
  metadata: jsonb("metadata"), // { delivery_address: {}, channel: 'Zomato', platform_id: '...' }
  version: integer("version").default(1).notNull(), // Optimistic Locking

  // Lifecycle Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  firstPrintedAt: timestamp("first_printed_at"),
  closedAt: timestamp("closed_at"),
  voidedAt: timestamp("voided_at")
}, (table) => {
  return {
    // 1. Dine-In orders MUST have a table
    dineInTableConstraint: check("dine_in_table_check", sql`${table.orderType} NOT IN ('DINE_IN', 'QR_SELF') OR ${table.tableId} IS NOT NULL`),
    // 2. Guest count must be positive
    guestCountConstraint: check("guest_count_check", sql`${table.guestCount} > 0`),
    // 3. Prevent Negative Totals
    positiveTotalConstraint: check("positive_total_check", sql`${table.grandTotal} >= 0`),

    // Phase 5 Indexes
    branchCreatedIdx: index("branch_created_idx").on(table.branchId, table.createdAt),
    shiftIdx: index("shift_idx").on(table.shiftId),
    customerIdx: index("customer_idx").on(table.customerId),
    statusIdx: index("status_idx").on(table.lifecycle, table.fulfillmentStatus),
  };
});

// --- ORDER STATUS HISTORY (Event Log) ---

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),

  // Transition Details
  changeType: varchar("change_type", { length: 50 }).notNull(), // 'LIFECYCLE', 'FULFILLMENT', 'PAYMENT'
  fromValue: text("from_value"),
  toValue: text("to_value").notNull(),

  // Audit Context
  actorId: uuid("actor_id").references(() => users.id).notNull(),
  reasonCode: text("reason_code"), // 'CUSTOMER_CHANGED_MIND', 'KITCHEN_ERROR', 'PAYMENT_FAILED'
  notes: text("notes"),

  // Financial Snapshot (Crucial for auditing changes to totals)
  grandTotalSnapshot: decimal("grand_total_snapshot", { precision: 12, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
