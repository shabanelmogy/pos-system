import { z } from "zod";

const localizedString = z.object({
  en: z.string().min(1, "English value is required"),
  ar: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: localizedString,
  images: z.array(z.string().url()).optional().default([]),
});

export const updateCategorySchema = z.object({
  name: localizedString.optional(),
  images: z.array(z.string().url()).optional(),
});
