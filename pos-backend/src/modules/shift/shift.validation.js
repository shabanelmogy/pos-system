import { z } from "zod";

export const openShiftSchema = z.object({
  branchId: z.string().uuid("Invalid Branch ID"),
  posPointId: z.string().uuid("Invalid Terminal ID"),
  cashierId: z.string().uuid("Invalid Cashier ID"),
  openingBalance: z.number().min(0).default(0),
});

export const closeShiftSchema = z.object({
  closingBalance: z.number().min(0),
  notes: z.string().optional(),
});
