import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { posPoints } from "../../pos/posPoint/posPoint.schema.js";

export const posSettings = pgTable("pos_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  posPointId: uuid("pos_point_id").references(() => posPoints.id).unique().notNull(),
  autoPrintReceipt: boolean("auto_print_receipt").default(true),
  allowDiscounts: boolean("allow_discounts").default(false),
  enableTables: boolean("enable_tables").default(true),
  requireCustomerOnOrder: boolean("require_customer_on_order").default(false),
  openOnMenu: boolean("open_on_menu").default(false),
  directPrint: boolean("direct_print").default(false),
  receiptPrinterName: text("receipt_printer_name"),
  kitchenPrinterName: text("kitchen_printer_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PosSettings = typeof posSettings.$inferSelect;
export type NewPosSettings = typeof posSettings.$inferInsert;
