import { z } from "zod";

const localizedString = z.object({
  en: z.string().min(1, "English name is required"),
  ar: z.string().optional(),
});

export const createPOSPointSchema = z.object({
  branchId: z.string().uuid("Invalid Branch ID"),
  name: localizedString,
  code: z.string().min(1, "Code is required"),
  isActive: z.boolean().optional().default(true),
});

export const updatePOSPointSchema = createPOSPointSchema.partial();
