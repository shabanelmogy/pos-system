import { z } from "zod";

export const createTableSchema = z.object({
  tableNo: z.coerce.number().int().positive(),
  seats: z.coerce.number().int().positive(),
});

export const updateTableSchema = z.object({
  status: z.enum(["Available", "Occupied", "Reserved", "Booked"]).optional(),
  currentOrderId: z.string().uuid().optional().nullable(),
});
