import { z } from "zod";

export const createPOSPointSchema = z.object({
  branchId: z.string().uuid("Invalid Branch ID"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  isActive: z.boolean().optional().default(true),
});

export const updatePOSPointSchema = createPOSPointSchema.partial();
