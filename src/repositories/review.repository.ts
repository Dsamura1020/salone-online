import type { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { ratingRepository } from "@/repositories/rating.repository";

export const reviewRepository = {
  countPendingModeration() {
    return prisma.review.count({
      where: { moderationStatus: { in: ["PENDING", "FLAGGED"] } },
    });
  },

  listPendingModeration(limit = 50) {
    return prisma.review.findMany({
      where: { moderationStatus: { in: ["PENDING", "FLAGGED"] } },
      include: {
        user: { select: { email: true } },
        business: { select: { businessName: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  listPublicByBusiness(businessId: string) {
    return prisma.review.findMany({
      where: {
        businessId,
        moderationStatus: "APPROVED",
        isHidden: false,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findExistingReview(params: {
    businessId: string;
    userId: string;
  }) {
    return prisma.review.findFirst({
      where: { userId: params.userId, businessId: params.businessId },
      select: { id: true },
    });
  },

  async submitReviewWithRating(params: {
    businessId: string;
    title: string;
    content: string;
    score: number;
    userId: string;
  }) {
    const existingReview = await this.findExistingReview(params);

    if (existingReview) {
      throw new Error("You have already submitted a review for this business");
    }

    const review = await prisma.review.create({
      data: {
        userId: params.userId,
        businessId: params.businessId,
        title: params.title,
        content: params.content,
        moderationStatus: "PENDING",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await ratingRepository.submitRating({
      businessId: params.businessId,
      score: params.score,
      userId: params.userId,
    });

    return review;
  },

  async updateReview(params: {
    reviewId: string;
    userId: string;
    title: string;
    content: string;
  }) {
    const existing = await prisma.review.findFirst({
      where: { id: params.reviewId, userId: params.userId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Review not found or you do not have permission to edit it");
    }

    return prisma.review.update({
      where: { id: params.reviewId },
      data: {
        title: params.title,
        content: params.content,
        isEdited: true,
      },
    });
  },

  async deleteReview(params: { reviewId: string; userId: string }) {
    const existing = await prisma.review.findFirst({
      where: { id: params.reviewId, userId: params.userId },
      select: { id: true, businessId: true },
    });

    if (!existing) {
      throw new Error("Review not found or you do not have permission to delete it");
    }

    await prisma.review.delete({ where: { id: params.reviewId } });
    return { businessId: existing.businessId };
  },

  async reportReview(params: {
    reviewId: string;
    reportedById: string;
    reason: string;
  }) {
    const existing = await prisma.reviewReport.findFirst({
      where: { reviewId: params.reviewId, reportedById: params.reportedById },
      select: { id: true },
    });

    if (existing) {
      throw new Error("You have already reported this review");
    }

    return prisma.reviewReport.create({
      data: {
        reviewId: params.reviewId,
        reportedById: params.reportedById,
        reason: params.reason,
      },
    });
  },

  listReports(params: { status?: ReportStatus } = {}) {
    return prisma.reviewReport.findMany({
      where: params.status ? { status: params.status } : undefined,
      include: {
        review: {
          select: {
            id: true,
            title: true,
            business: { select: { businessName: true } },
          },
        },
        reportedBy: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateReportStatus(params: { reportId: string; status: ReportStatus }) {
    return prisma.reviewReport.update({
      where: { id: params.reportId },
      data: { status: params.status },
    });
  },

  moderateReview(params: {
    reviewId: string;
    moderationStatus: "APPROVED" | "REJECTED" | "FLAGGED";
    isHidden?: boolean;
  }) {
    return prisma.review.update({
      where: { id: params.reviewId },
      data: {
        moderationStatus: params.moderationStatus,
        ...(params.isHidden !== undefined ? { isHidden: params.isHidden } : {}),
      },
      select: { id: true, businessId: true, moderationStatus: true },
    });
  },

  listAllReviewsForModeration(limit = 100) {
    return prisma.review.findMany({
      where: {
        moderationStatus: { in: ["PENDING", "FLAGGED", "APPROVED", "REJECTED"] },
      },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        business: { select: { businessName: true, slug: true } },
        reports: { select: { id: true, reason: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getRatingForReview(params: {
    businessId: string;
    userId: string | null;
    visitorId: string | null;
  }) {
    if (params.userId) {
      const rating = await prisma.rating.findFirst({
        where: {
          userId: params.userId,
          businessId: params.businessId,
        },
        select: { score: true },
      });
      return rating ? { score: Number(rating.score) } : null;
    }

    if (params.visitorId) {
      const rating = await prisma.rating.findFirst({
        where: {
          visitorId: params.visitorId,
          businessId: params.businessId,
        },
        select: { score: true },
      });
      return rating ? { score: Number(rating.score) } : null;
    }

    return null;
  },
};
