import { pgTable, text, uuid, timestamp, boolean, numeric, jsonb } from "drizzle-orm/pg-core";

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").$type<Record<string, string>>().notNull(),
  code: text("code").notNull().unique(), // e.g., 'BR-CAIRO-01'
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  country: text("country").default("India"),
  isActive: boolean("is_active").default(true),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  serviceChargeRate: numeric("service_charge_rate", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
