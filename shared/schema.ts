import { z } from "zod";

export const generateNamesSchema = z.object({
  gender: z.string().optional(),
  usage: z.string(),
  number: z.number().min(1).max(6),
  randomsurname: z.boolean()
});

export const nameDataSchema = z.object({
  name: z.string(),
  meaning: z.string().optional(),
  usage: z.string().optional()
});

// API returns simple string arrays for random names
export const randomApiResponseSchema = z.object({
  names: z.array(z.string()).optional(),
  error: z.string().optional()
});

// Lookup API returns detailed name information
export const lookupApiResponseSchema = z.array(z.object({
  name: z.string(),
  gender: z.string().optional(),
  usages: z.array(z.object({
    usage_code: z.string(),
    usage_full: z.string(),
    usage_gender: z.string().optional()
  })).optional()
}));

export const apiResponseSchema = z.object({
  names: z.array(nameDataSchema).optional(),
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
