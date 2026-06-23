import { z } from "zod";
import { isValidRatingScore } from "@/lib/ratings/half-star";

const halfStarScore = z
  .number()
  .refine(isValidRatingScore, "Score must be between 0.5 and 5 in 0.5 steps");

export const submitRatingSchema = z.object({
  score: halfStarScore,
});

export type SubmitRatingInput = z.infer<typeof submitRatingSchema>;
