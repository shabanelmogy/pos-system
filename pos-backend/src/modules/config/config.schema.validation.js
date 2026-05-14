import { z } from "zod";

// ─── Re-usable primitives ────────────────────────────────────────────────────

const uuid = z.string().uuid("Must be a valid UUID");

// Name can be a plain string OR a localised object { en, ar }
const localisedString = z.union([
  z.string().min(1, "Name is required"),
  z.object({
    en: z.string().min(1, "English name is required"),
    ar: z.string().optional(),
  }),
]);

// ─── Config Option ───────────────────────────────────────────────────────────

export const configOptionSchema = z.object({
  id:           z.string().optional(),
  name:         localisedString,
  internalCode: z.string().optional(),
  description:  z.string().optional(),
  isDefault:    z.boolean().optional().default(false),
  sortOrder:    z.number().int().optional().default(0),
  uiMetadata:   z.record(z.unknown()).optional().default({}),
});

// ─── Config Component ────────────────────────────────────────────────────────

export const configComponentSchema = z.object({
  id:            z.string().optional(),
  name:          localisedString,
  internalCode:  z.string().optional(),
  type:          z.enum(["SINGLE_SELECT", "MULTI_SELECT", "BOOLEAN", "TEXT", "NUMBER"])
                  .default("SINGLE_SELECT"),
  isRequired:    z.boolean().optional().default(false),
  sortOrder:     z.number().int().optional().default(0),
  validationDsl: z.record(z.unknown()).optional().default({}),
  uiMetadata:    z.record(z.unknown()).optional().default({}),
  options:       z.array(configOptionSchema).optional().default([]),
});

// ─── Logic Rule ──────────────────────────────────────────────────────────────

export const configLogicRuleSchema = z.object({
  id:          z.string().optional(),
  condition:   z.object({
    componentId: z.string().optional().default(""),
    value:       z.string().optional().default(""),
  }).optional().default({}),
  action:      z.enum(["HIDE", "SHOW", "REQUIRE", "DISABLE"]).optional().default("HIDE"),
  targetId:    z.string().optional().default(""),
  priority:    z.number().int().optional().default(0),
  actionConfig:z.record(z.unknown()).optional().default({}),
});

// ─── Create / Update Profile ─────────────────────────────────────────────────

export const createProfileSchema = z.object({
  name:         localisedString,
  description:  z.union([localisedString, z.string()]).optional(),
  internalCode: z.string()
                  .min(2, "Internal code must be at least 2 characters")
                  .max(100, "Internal code is too long")
                  .regex(/^[A-Z0-9_\-]+$/i, "Internal code can only contain letters, numbers, underscores and hyphens")
                  .optional()
                  .or(z.literal("")),
  uiConfig:     z.record(z.unknown()).optional().default({}),
  components:   z.array(configComponentSchema).optional().default([]),
  logicRules:   z.array(configLogicRuleSchema).optional().default([]),
  status:       z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
});

export const updateProfileSchema = createProfileSchema.partial();

// ─── Assignment ───────────────────────────────────────────────────────────────

export const createAssignmentSchema = z.object({
  profileId:     uuid,
  targetId:      uuid,
  targetType:    z.enum(["PRODUCT", "CATEGORY"]),
  contextConfig: z.record(z.unknown()).optional().default({}),
  priority:      z.number().int().optional().default(0),
});

// ─── Price Rule ───────────────────────────────────────────────────────────────

export const createPriceRuleSchema = z.object({
  profileId:    uuid,
  assignmentId: uuid.optional(),
  targetType:   z.enum(["OPTION", "COMPONENT", "GLOBAL"]),
  targetId:     uuid,
  strategy:     z.enum(["FIXED", "PERCENTAGE", "TIERED", "FORMULA", "OVERRIDE"]),
  amount:       z.coerce.number({ invalid_type_error: "Amount must be a number" }),
  name:         z.string().optional(),
  strategyData: z.record(z.unknown()).optional().default({}),
  priority:     z.number().int().optional().default(0),
});
