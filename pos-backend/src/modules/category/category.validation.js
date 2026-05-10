import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  images: z.array(z.string().url()).optional().default([]),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
});
