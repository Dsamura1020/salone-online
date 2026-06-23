import { z } from "zod";
import { isValidRatingScore } from "@/lib/ratings/half-star";

const halfStarScore = z
  .number()
  .refine(isValidRatingScore, "Score must be between 0.5 and 5 in 0.5 steps");

export const createRatingSchema = z.object({
  score: halfStarScore,
});

export const createReviewSchema = z.object({
  businessId: z.uuid(),
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
  score: halfStarScore,
});

export const submitReviewSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
  score: halfStarScore,
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(["APPROVED", "REJECTED", "FLAGGED"]),
  isHidden: z.boolean().optional(),
});

export const editReviewSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
});

export const reportReviewSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type EditReviewInput = z.infer<typeof editReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
