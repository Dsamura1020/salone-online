import { prisma } from "@/lib/prisma/prisma";

export async function recalculateBusinessRating(businessId: string) {
  const aggregate = await prisma.rating.aggregate({
    where: { businessId },
    _avg: { score: true },
    _count: { score: true },
  });

  const approvedReviewCount = await prisma.review.count({
    where: {
      businessId,
      moderationStatus: "APPROVED",
      isHidden: false,
    },
  });

  const averageRating = Number(aggregate._avg.score ?? 0);

  await prisma.business.update({
    where: { id: businessId },
    data: {
      averageRating,
      reviewCount: approvedReviewCount,
    },
  });

  return {
    averageRating,
    reviewCount: approvedReviewCount,
    ratingCount: aggregate._count.score,
  };
}

export const ratingRepository = {
  findBusinessForRating(businessId: string) {
    return prisma.business.findFirst({
      where: {
        id: businessId,
        verificationStatus: "APPROVED",
      },
      select: { id: true, ownerId: true, businessName: true },
    });
  },

  async findExistingRating(params: {
    businessId: string;
    userId: string;
  }) {
    const rating = await prisma.rating.findFirst({
      where: {
        userId: params.userId,
        businessId: params.businessId,
      },
      select: { score: true },
    });

    if (!rating) {
      return null;
    }

    return { score: Number(rating.score) };
  },

  async submitRating(params: {
    businessId: string;
    score: number;
    userId: string;
  }) {
    const existing = await prisma.rating.findFirst({
      where: {
        userId: params.userId,
        businessId: params.businessId,
      },
    });

    if (existing) {
      await prisma.rating.update({
        where: { id: existing.id },
        data: { score: params.score },
      });
    } else {
      await prisma.rating.create({
        data: {
          userId: params.userId,
          businessId: params.businessId,
          score: params.score,
        },
      });
    }

    return recalculateBusinessRating(params.businessId);
  },

  recalculateBusinessRating,
};
