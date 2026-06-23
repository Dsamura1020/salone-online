import type { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { reviewRepository } from "@/repositories/review.repository";
import { ratingRepository } from "@/repositories/rating.repository";

export async function countReviewsPendingModeration() {
  return reviewRepository.countPendingModeration();
}

export async function listReviewsPendingModeration(limit = 50) {
  return reviewRepository.listPendingModeration(limit);
}

export async function listPublicBusinessReviews(businessId: string) {
  const reviews = await reviewRepository.listPublicByBusiness(businessId);

  const ratings = await Promise.all(
    reviews.map((review) =>
      reviewRepository.getRatingForReview({
        businessId,
        userId: review.userId,
        visitorId: null,
      }),
    ),
  );

  return reviews.map((review, index) => ({
    id: review.id,
    title: review.title,
    content: review.content,
    createdAt: review.createdAt,
    authorId: review.userId ?? null,
    authorName: review.user
      ? `${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim() ||
        review.user.email
      : "Guest reviewer",
    score: ratings[index]?.score ?? null,
  }));
}

export async function editBusinessReview(params: {
  reviewId: string;
  userId: string;
  title: string;
  content: string;
}) {
  return reviewRepository.updateReview(params);
}

export async function deleteBusinessReview(params: {
  reviewId: string;
  userId: string;
}) {
  const result = await reviewRepository.deleteReview(params);
  await ratingRepository.recalculateBusinessRating(result.businessId);
  return result;
}

export async function reportReview(params: {
  reviewId: string;
  reportedById: string;
  reason: string;
}) {
  return reviewRepository.reportReview(params);
}

export async function listAllReports(status?: ReportStatus) {
  return reviewRepository.listReports(status ? { status } : {});
}

export async function resolveReport(params: {
  reportId: string;
  status: ReportStatus;
}) {
  return reviewRepository.updateReportStatus(params);
}

export async function moderateReview(params: {
  reviewId: string;
  moderationStatus: "APPROVED" | "REJECTED" | "FLAGGED";
  isHidden?: boolean;
}) {
  const updated = await reviewRepository.moderateReview(params);
  if (
    params.moderationStatus === "APPROVED" ||
    params.moderationStatus === "REJECTED"
  ) {
    await ratingRepository.recalculateBusinessRating(updated.businessId);
  }
  return updated;
}

export async function listAllReviewsForModeration(limit?: number) {
  return reviewRepository.listAllReviewsForModeration(limit);
}

export async function submitBusinessReview(params: {
  businessId: string;
  title: string;
  content: string;
  score: number;
  userId: string;
}) {
  const business = await prisma.business.findFirst({
    where: {
      id: params.businessId,
      verificationStatus: "APPROVED",
    },
    select: { id: true, ownerId: true },
  });

  if (!business) {
    throw new Error("Business not found");
  }

  if (params.userId === business.ownerId) {
    throw new Error("Business owners cannot review their own business");
  }

  return reviewRepository.submitReviewWithRating(params);
}
