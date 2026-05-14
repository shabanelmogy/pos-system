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
  customerDetails: z.object({ // Snapshot — all fields optional; service fills Guest defaults
    name: z.string().optional(),
    phone: z.string().optional(),
    guests: z.number().int().nonnegative().optional(),
  }).optional(),
  orderStatus: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  tableId: z.string().uuid().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  
  // Enterprise fields
  branchId: z.string().uuid().optional().nullable(),
  posPointId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  cashierId: z.string().uuid()
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.string().min(1),
});
