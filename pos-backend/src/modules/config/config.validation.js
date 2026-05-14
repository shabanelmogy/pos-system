import { z } from "zod";

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.any(), // JSONB for localization
  internalCode: z.string().max(100).optional(),
  price: z.number().default(0),
  sortOrder: z.number().optional(),
});

const componentSchema = z.object({
  id: z.string().optional(),
  name: z.any(),
  internalCode: z.string().max(100).optional(),
  type: z.enum([
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
    "GROUP"
  ]),
  isRequired: z.boolean().default(false).optional(),
  sortOrder: z.number().optional(),
  options: z.array(optionSchema).optional(),
});

const logicRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  condition: z.any().optional(), // Match frontend structure
  conditionDsl: z.any().optional(),
  action: z.string(),
  targetType: z.string().optional(),
  targetId: z.string(),
  priority: z.number().optional(),
});

const priceRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  strategy: z.string().optional(),
  adjustmentType: z.string().optional(), // Match frontend structure
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  amount: z.number().optional(),
  strategyData: z.any().optional(),
});

export const createProfileSchema = z.object({
  name: z.any(),
  internalCode: z.string().max(100).optional(),
  components: z.array(componentSchema).optional(),
  logicRules: z.array(logicRuleSchema).optional(),
  priceRules: z.array(priceRuleSchema).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const assignmentSchema = z.object({
  profileId: z.string().uuid(),
  targetId: z.string().uuid(),
  targetType: z.enum(["PRODUCT", "CATEGORY", "BRAND", "SERVICE", "BUNDLE", "VENDOR", "COLLECTION"]),
});
