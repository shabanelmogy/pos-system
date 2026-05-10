import { z } from "zod";

export const createOrderSchema = z.object({
  customerDetails: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    guests: z.number().int().positive(),
  }),
  orderStatus: z.string().min(1),
  bills: z.object({
    total: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    totalWithTax: z.number().nonnegative(),
  }),
  items: z.array(z.any()),
  tableId: z.string().uuid().optional(),
  paymentMethod: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.string().min(1),
});
