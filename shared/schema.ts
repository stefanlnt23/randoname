import { z } from "zod";

export const generateNamesSchema = z.object({
  gender: z.string().optional(),
  usage: z.string(),
  number: z.number().min(1).max(6)
});

export const nameDataSchema = z.object({
  name: z.string(),
  meaning: z.string().optional(),
  usage: z.string().optional(),
  gender: z.string().optional(),
  etymology: z.string().optional(),
  relatedNames: z.array(z.string()).optional()
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
  savedAt: z.string()
});

// Search schema for name lookup
export const searchNameSchema = z.object({
  name: z.string().min(1),
  exact: z.boolean().optional()
});

// Related names schema
export const relatedNamesSchema = z.object({
  name: z.string().min(1),
  usage: z.string().optional(),
  gender: z.string().optional()
});

export type SavedName = z.infer<typeof savedNameSchema>;
export type SearchNameRequest = z.infer<typeof searchNameSchema>;
export type RelatedNamesRequest = z.infer<typeof relatedNamesSchema>;
