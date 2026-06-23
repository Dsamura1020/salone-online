import { z } from "zod";

const searchStatusSchema = z.enum([
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

const baseSearchSchema = z.object({
  q: z.string().trim().min(1).max(500).optional(),
  userId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: searchStatusSchema.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(["relevance", "rating", "newest"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const searchQuerySchema = baseSearchSchema;

export const searchPostSchema = z
  .object({
    query: z.string().trim().min(1).max(500).optional(),
    q: z.string().trim().min(1).max(500).optional(),
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    status: searchStatusSchema.optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(["relevance", "rating", "newest"]).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .transform((input) => ({
    q: input.query ?? input.q,
    userId: input.userId,
    categoryId: input.categoryId,
    locationId: input.locationId,
    status: input.status,
    minRating: input.minRating,
    sort: input.sort ?? "relevance",
    page: input.page ?? 1,
    limit: input.limit ?? 10,
  }));

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type SearchPostInput = z.infer<typeof searchPostSchema>;
