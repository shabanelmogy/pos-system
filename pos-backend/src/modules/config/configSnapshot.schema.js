import { pgTable, uuid, jsonb, timestamp, numeric, varchar } from "drizzle-orm/pg-core";

/**
 * Enterprise Snapshot Strategy
 * 
 * Instead of just saving selected IDs, we save a deep JSON blob that represents
 * the exact configuration profile, components, options, pricing, and rules 
 * active at the time of the transaction.
 */

export const configSnapshots = pgTable("config_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Reference to the originating profile version
  profileId: uuid("profile_id"),
  profileVersion: integer("profile_version"),
  
  // 'CART', 'ORDER'
  ownerType: varchar("owner_type", { length: 50 }).notNull(),
  ownerId: uuid("owner_id").notNull(),
  
  /**
   * Complete Snapshot Data:
   * {
   *   selections: [ { componentId, optionId, value, metadata } ],
   *   resolvedPrices: [ { targetId, amount, strategy, currency } ],
   *   resolvedRules: [ { ruleId, action, state } ],
   *   localizedMetadata: { profileName, componentNames, optionNames },
   *   taxSnapshot: { ... },
   *   validationResult: { isValid: true }
   * }
   */
  fullState: jsonb("full_state").notNull(),
  
  // Totals for performance indexing
  totalPriceAdjustment: numeric("total_price_adjustment", { precision: 14, scale: 4 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { integer } from "drizzle-orm/pg-core";
