import { pgTable, uuid, varchar, text, integer, numeric, jsonb, boolean, timestamp, pgEnum, index, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";

// --- STRONGLY TYPED ENUMS ---

export const lifecycleStatusEnum = pgEnum("config_lifecycle_status", ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"]);

export const componentTypeEnum = pgEnum("config_component_type", [
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "TOGGLE",
  "TEXT_INPUT",
  "NUMBER_INPUT",
  "DATE_PICKER",
  "TIME_PICKER",
  "FILE_UPLOAD",
  "WARRANTY",
  "SUBSCRIPTION",
  "GROUP",
]);

export const pricingStrategyEnum = pgEnum("config_pricing_strategy", [
  "FIXED",
  "PERCENTAGE",
  "QUANTITY_BASED",
  "FORMULA",
  "TIERED",
  "OVERRIDE",
  "BUNDLE_DISCOUNT",
]);

export const ruleActionEnum = pgEnum("config_rule_action", [
  "HIDE",
  "SHOW",
  "ENABLE",
  "DISABLE",
  "SET_VALUE",
  "REQUIRE",
  "APPLY_PRICE_RULE",
  "TRIGGER_INVENTORY_RULE",
  "VALIDATION_ERROR",
]);

export const assignmentTargetEnum = pgEnum("config_assignment_target", [
  "PRODUCT",
  "CATEGORY",
  "BRAND",
  "SERVICE",
  "BUNDLE",
  "VENDOR",
  "COLLECTION",
  "SUBSCRIPTION_PLAN",
]);

export const inventoryBehaviorEnum = pgEnum("config_inventory_behavior", [
  "DEDUCT",
  "RESERVE",
  "VALIDATE_ONLY",
]);

// --- TABLES ---

// 1. Configuration Profiles (Core + Versioning)
export const configProfiles = pgTable("config_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  baseProfileId: uuid("base_profile_id"), // Root ID for version lineage
  versionNumber: integer("version_number").default(1).notNull(),
  status: lifecycleStatusEnum("status").default("DRAFT").notNull(),
  isCurrentPublished: boolean("is_current_published").default(false).notNull(),
  
  // Localization: { "en": "Standard Toppings", "ar": "إضافات قياسية" }
  name: jsonb("name").notNull(), 
  description: jsonb("description"),
  
  internalCode: varchar("internal_code", { length: 100 }),
  isTemplate: boolean("is_template").default(false).notNull(),
  
  // UI Rendering Settings: { theme: 'dark', layout: 'grid', columns: 2 }
  uiConfig: jsonb("ui_config").default({}),
  
  // Audit & Lifecycle
  createdBy: uuid("created_by").notNull(),
  updatedBy: uuid("updated_by"),
  publishedBy: uuid("published_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  deletedAt: timestamp("deleted_at"), // Soft Delete
}, (t) => ({
  baseProfileIdx: index("profile_lineage_idx").on(t.baseProfileId),
  codeUnique: uniqueIndex("profile_code_unique").on(t.internalCode).where(t.deletedAt === null),
}));

// 2. Configuration Components (Hierarchy + Metadata)
export const configComponents = pgTable("config_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => configProfiles.id).notNull(),
  parentComponentId: uuid("parent_component_id"), // Hierarchical support
  
  name: jsonb("name").notNull(),
  internalCode: varchar("internal_code", { length: 100 }).notNull(),
  
  type: componentTypeEnum("type").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  
  /**
   * Validation DSL:
   * { 
   *   "text": { "min": 5, "max": 255, "regex": "^[A-Z]+$" },
   *   "number": { "min": 0, "max": 100, "precision": 2 },
   *   "date": { "min": "2024-01-01", "blackout": ["2024-12-25"] },
   *   "selection": { "min": 1, "max": 5 }
   * }
   */
  validationDsl: jsonb("validation_dsl").default({}),
  
  /**
   * UI Behavior/Metadata:
   * { "placeholder": "...", "helpText": "...", "icon": "...", "hiddenInPos": false }
   */
  uiMetadata: jsonb("ui_metadata").default({}),
  
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

// 3. Configuration Options (The Choices)
export const configOptions = pgTable("config_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  componentId: uuid("component_id").references(() => configComponents.id).notNull(),
  
  name: jsonb("name").notNull(),
  description: jsonb("description"),
  internalCode: varchar("internal_code", { length: 100 }).notNull(),
  
  isDefault: boolean("is_default").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  
  // Rendering data (e.g., color hex, image URL, badge text)
  uiMetadata: jsonb("ui_metadata").default({}),
});

// 4. Configuration Pricing Engine (Advanced Strategies)
export const configPriceRules = pgTable("config_price_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => configProfiles.id).notNull(),
  
  name: varchar("name", { length: 255 }),
  strategy: pricingStrategyEnum("strategy").notNull(),
  
  // Targets (Polymorphic but strongly typed via logic)
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'COMPONENT', 'OPTION', 'GLOBAL'
  targetId: uuid("target_id"), 
  
  amount: numeric("amount", { precision: 16, scale: 6 }).default("0.000000"),
  
  /**
   * Strategy Metadata:
   * { 
   *   "tiers": [ { "min": 1, "price": 10 }, { "min": 5, "price": 8 } ],
   *   "formula": "(B * 1.1) + 5",
   *   "bundle": { "requiredOptionIds": ["..."], "discount": 20 }
   * }
   */
  strategyData: jsonb("strategy_data").default({}),
  
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

// 5. Configuration Logic Rules (The Platform Brain)
export const configLogicRules = pgTable("config_logic_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => configProfiles.id).notNull(),
  
  name: varchar("name", { length: 255 }),
  
  /**
   * Rules DSL (Enterprise Grade):
   * {
   *   "logic": "AND",
   *   "conditions": [
   *     { "fact": "selection", "path": "$.size", "operator": "EQ", "value": "large" },
   *     { "fact": "qty", "operator": "GT", "value": 5 }
   *   ]
   * }
   */
  conditionDsl: jsonb("condition_dsl").notNull(),
  
  action: ruleActionEnum("action").notNull(),
  
  // Action Targets
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'COMPONENT', 'OPTION', 'PRICE_RULE', 'INVENTORY_RULE'
  targetId: uuid("target_id").notNull(),
  
  // Action Config: { value: "...", message: "...", triggerQty: 2 }
  actionConfig: jsonb("action_config").default({}),
  
  priority: integer("priority").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// 6. Generic Polymorphic Assignments
export const configAssignments = pgTable("config_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => configProfiles.id).notNull(),
  
  targetType: assignmentTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(), // UUID of Product, Category, etc.
  
  priority: integer("priority").default(0), // For inheritance resolution
  contextConfig: jsonb("context_config").default({}), // Contextual overrides
}, (t) => ({
  targetLookupIdx: index("assignment_lookup_idx").on(t.targetType, t.targetId),
}));

// 7. Enterprise Inventory Rules
export const configInventoryRules = pgTable("config_inventory_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  optionId: uuid("option_id").references(() => configOptions.id),
  
  inventoryTargetType: varchar("inventory_target_type", { length: 50 }).default("SKU"),
  inventoryTargetId: varchar("inventory_target_id", { length: 255 }).notNull(), // SKU or Inventory UUID
  
  behavior: inventoryBehaviorEnum("behavior").default("DEDUCT").notNull(),
  
  // Deduction logic: "1", "Q * 0.5", "IF(size=large, 2, 1)"
  quantityFormula: text("quantity_formula").default("1"),
  
  isActive: boolean("is_active").default(true).notNull(),
});

// 8. Immutable Snapshot Architecture (Historical Consistency)
export const configSnapshots = pgTable("config_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Ownership
  ownerType: varchar("owner_type", { length: 50 }).notNull(), // 'CART', 'ORDER', 'QUOTE'
  ownerId: uuid("owner_id").notNull(),
  
  // References for traceability (soft references)
  profileId: uuid("profile_id"),
  profileVersion: integer("profile_version"),
  
  /**
   * Complete Configuration Snapshot:
   * Captures the entire evaluated state of the product configuration
   * at the millisecond the order was placed.
   * 
   * Includes: 
   * - userSelections: [ { componentCode, optionCode, value, priceAdjustment } ]
   * - profileSnapshot: { name, components: [...] }
   * - resolvedPricing: { basePrice, adjustment, total, currency }
   * - appliedRules: [ { ruleId, action } ]
   * - taxSnapshot: { rate, amount, logic }
   */
  fullState: jsonb("full_state").notNull(),
  
  totalAdjustment: numeric("total_adjustment", { precision: 16, scale: 4 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Audit Trail
export const configAuditLogs = pgTable("config_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'PROFILE', 'RULE', 'PRICE'
  entityId: uuid("entity_id").notNull(),
  
  action: varchar("action", { length: 50 }).notNull(), // 'CREATE', 'UPDATE', 'PUBLISH', 'DELETE'
  
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
