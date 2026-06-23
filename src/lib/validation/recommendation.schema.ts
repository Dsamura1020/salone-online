import { z } from "zod";

const recommendationStatusSchema = z.enum([
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

const baseRecommendationQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: recommendationStatusSchema.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const similarRecommendationQuerySchema = baseRecommendationQuerySchema.extend({
  businessId: z.string().uuid(),
});

export const suggestedRecommendationQuerySchema = baseRecommendationQuerySchema;

export const trendingRecommendationQuerySchema = baseRecommendationQuerySchema;

export type SimilarRecommendationQueryInput = z.infer<
  typeof similarRecommendationQuerySchema
>;
export type SuggestedRecommendationQueryInput = z.infer<
  typeof suggestedRecommendationQuerySchema
>;
export type TrendingRecommendationQueryInput = z.infer<
  typeof trendingRecommendationQuerySchema
>;
