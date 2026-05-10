import { z } from "zod";

const orderItemSchema = z.object({
  menuItemId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  notes: z.string().optional(),
  name: z.string().min(1), // For snapshot
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerDetails: z.object({ // Snapshot of legacy info
    name: z.string().min(1),
    phone: z.string().min(1),
    guests: z.number().int().positive(),
  }),
  orderStatus: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  tableId: z.string().uuid().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.string().min(1),
});
