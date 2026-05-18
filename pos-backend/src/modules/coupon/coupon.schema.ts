import { pgTable, uuid, varchar, decimal, timestamp, boolean, pgEnum, integer } from "drizzle-orm/pg-core";

export const couponTypeEnum = pgEnum("coupon_type", ["PERCENTAGE", "FIXED"]);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  type: couponTypeEnum("type").default("PERCENTAGE").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 12, scale: 2 }), // Useful for percentage coupons
  isActive: boolean("is_active").default(true).notNull(),
  validUntil: timestamp("valid_until"),
  usageLimitPerCustomer: integer("usage_limit_per_customer"),
  totalUsageLimit: integer("total_usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
