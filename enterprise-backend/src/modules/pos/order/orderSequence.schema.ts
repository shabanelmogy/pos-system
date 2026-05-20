import { pgTable, uuid, integer, date, primaryKey, index } from "drizzle-orm/pg-core";
import { branches } from "../../system/branch/branch.schema.js";

export const orderSequences = pgTable("order_sequences", {
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  date: date("date").notNull(),
  lastNumber: integer("last_number").default(0).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.branchId, table.date] }),
    dateIdx: index("date_idx").on(table.date),
  };
});

export type OrderSequence = typeof orderSequences.$inferSelect;
export type NewOrderSequence = typeof orderSequences.$inferInsert;
