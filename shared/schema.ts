import { z } from "zod";

export const generateNamesSchema = z.object({
  gender: z.enum(['m', 'f', '']).optional(),
  usage: z.string(),
  number: z.number().min(1).max(6),
  randomsurname: z.boolean()
});

export const nameDataSchema = z.object({
  name: z.string(),
  meaning: z.string().optional(),
  usage: z.string().optional()
});

export const apiResponseSchema = z.object({
  names: z.array(nameDataSchema).optional(),
  name: nameDataSchema.optional(),
  error: z.string().optional()
});

export type GenerateNamesRequest = z.infer<typeof generateNamesSchema>;
export type NameData = z.infer<typeof nameDataSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;

export const savedNameSchema = z.object({
  name: z.string(),
  meaning: z.string().optional(),
  savedAt: z.number()
});

export type SavedName = z.infer<typeof savedNameSchema>;
