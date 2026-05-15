import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.union([z.string(), z.number()]),
  minOrderAmount: z.union([z.string(), z.number()]).optional(),
  maxDiscountAmount: z.union([z.string(), z.number()]).optional().nullable(),
  isActive: z.boolean().optional(),
  validUntil: z.preprocess((val) => (val === "" || !val ? null : new Date(val)), z.date().optional().nullable()),
  usageLimitPerCustomer: z.number().int().positive().optional().nullable(),
  totalUsageLimit: z.number().int().positive().optional().nullable(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponQuerySchema = z.object({
  code: z.string().min(1),
  orderAmount: z.string().regex(/^\d+(\.\d{1,2})?$/)
});
