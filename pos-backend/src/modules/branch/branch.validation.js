import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional().default("India"),
  isActive: z.boolean().optional().default(true),
});

export const updateBranchSchema = createBranchSchema.partial();
