import { z } from "zod";

const localizedString = z.object({
  en: z.string().min(1, "English value is required"),
  ar: z.string().optional(),
});

export const createItemSchema = z.object({
  name: localizedString,
  description: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(),
  price: z.coerce.number().positive(),
  images: z.array(z.string().url()).optional().default([]),
  categoryId: z.string().uuid(),
});

export const updateItemSchema = z.object({
  name: localizedString.optional(),
  description: z.object({ en: z.string().optional(), ar: z.string().optional() }).optional(),
  price: z.coerce.number().positive().optional(),
  images: z.array(z.string().url()).optional(),
  categoryId: z.string().uuid().optional(),
});
