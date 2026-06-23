import { ratingRepository } from "@/repositories/rating.repository";

export async function submitBusinessRating(params: {
  businessId: string;
  score: number;
  userId: string;
}) {
  const business = await ratingRepository.findBusinessForRating(params.businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  if (params.userId === business.ownerId) {
    throw new Error("Business owners cannot rate their own business");
  }

  return ratingRepository.submitRating(params);
}

export async function getBusinessRatingForActor(params: {
  businessId: string;
  userId: string;
}) {
  const rating = await ratingRepository.findExistingRating(params);
  return rating?.score ?? null;
}
