import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  images: z.array(z.string().url()).optional().default([]),
  categoryId: z.string().uuid(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  images: z.array(z.string().url()).optional(),
  categoryId: z.string().uuid().optional(),
});
