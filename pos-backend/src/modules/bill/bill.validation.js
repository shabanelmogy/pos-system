import { z } from "zod";

export const createBillSchema = z.object({
  orderId: z.string().uuid(),
  totalAmount: z.number().positive(),
  taxAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().optional().default(0),
  status: z.string().optional().default("Unpaid"),
});

export const updateBillStatusSchema = z.object({
  status: z.enum(["Paid", "Partially Paid", "Unpaid"]),
});
