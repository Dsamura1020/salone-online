import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { countReviewsPendingModeration } from "@/services/review.service";

export type AdminStatCard = {
  label: string;
  value: number;
  trend: number;
  trendLabel: string;
  positive: boolean;
};

export type AdminVerificationPreview = {
  id: string;
  businessName: string;
  categoryName: string;
  status: string;
  submittedAt: Date;
  progress: number;
  documentCount: number;
};

export type AdminReviewPreview = {
  id: string;
  userName: string;
  userInitials: string;
  businessName: string;
  rating: number | null;
  excerpt: string;
  createdAt: Date;
  moderationStatus: string;
};

export type AdminCategorySlice = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type AdminPlatformHealth = {
  label: string;
  value: string;
  tone: "good" | "warn";
  sparkline: number[];
};

export type AdminDashboardData = {
  stats: AdminStatCard[];
  verificationQueue: AdminVerificationPreview[];
  recentReviews: AdminReviewPreview[];
  categories: AdminCategorySlice[];
  platformHealth: AdminPlatformHealth[];
  totalBusinesses: number;
  notificationCount: number;
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
  "#818cf8",
  "#94a3b8",
];

const DOCUMENT_TYPE_COUNT = 7;

function trendPercent(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function initialsFromName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] ?? "U"}${words[1]?.[0] ?? ""}`.toUpperCase();
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 1) {
    return "Just now";
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function dayBounds(daysAgo: number, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

async function dailyCountsForLastWeek(
  counter: (range: { start: Date; end: Date }) => Promise<number>,
) {
  const now = new Date();
  const points: number[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const range = dayBounds(daysAgo, now);
    points.push(await counter(range));
  }

  return points;
}

function computeVerificationProgress(input: {
  status: string;
  documentCount: number;
  hasDescription: boolean;
  hasLogo: boolean;
}) {
  const documentProgress = Math.round(
    (Math.min(input.documentCount, DOCUMENT_TYPE_COUNT) / DOCUMENT_TYPE_COUNT) *
      60,
  );
  const profileProgress =
    (input.hasDescription ? 20 : 0) + (input.hasLogo ? 10 : 0);
  const reviewProgress = input.status === "UNDER_REVIEW" ? 10 : 0;

  return Math.min(100, documentProgress + profileProgress + reviewProgress);
}

function formatHours(hours: number) {
  if (hours <= 0) {
    return "0 hrs";
  }

  return `${hours.toFixed(1)} hrs`;
}

export { relativeTime, initialsFromName };

export async function getAdminNotificationCount() {
  const [pendingVerifications, pendingReviews] = await Promise.all([
    prisma.verificationRequest.count({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    }),
    countReviewsPendingModeration(),
  ]);

  return pendingVerifications + pendingReviews;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersThisWeek,
    usersLastWeek,
    totalBusinesses,
    businessesThisWeek,
    businessesLastWeek,
    pendingVerifications,
    pendingSubmittedThisWeek,
    pendingSubmittedLastWeek,
    flaggedReviews,
    flaggedThisWeek,
    flaggedLastWeek,
    pendingVerificationItems,
    recentReviewsRaw,
    categoryGroups,
    totalVerificationRequests,
    approvedVerifications,
    totalReviews,
    approvedReviews,
    recentDecisions,
    publishedBusinesses,
    notificationCount,
    verificationApprovalTrend,
    reviewApprovalTrend,
    businessCreationTrend,
    responseTimeTrend,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.business.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    prisma.verificationRequest.count({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    }),
    prisma.verificationRequest.count({
      where: {
        status: { in: ["PENDING", "UNDER_REVIEW"] },
        submittedAt: { gte: weekAgo },
      },
    }),
    prisma.verificationRequest.count({
      where: {
        status: { in: ["PENDING", "UNDER_REVIEW"] },
        submittedAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    countReviewsPendingModeration(),
    prisma.review.count({
      where: {
        moderationStatus: { in: ["PENDING", "FLAGGED"] },
        createdAt: { gte: weekAgo },
      },
    }),
    prisma.review.count({
      where: {
        moderationStatus: { in: ["PENDING", "FLAGGED"] },
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    prisma.verificationRequest.findMany({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
      include: {
        business: {
          select: {
            businessName: true,
            description: true,
            logoUrl: true,
            category: { select: { name: true } },
            documents: { select: { id: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 3,
    }),
    prisma.review.findMany({
      where: { moderationStatus: { in: ["PENDING", "FLAGGED"] } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        business: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.business.groupBy({
      by: ["categoryId"],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: "desc" } },
    }),
    prisma.verificationRequest.count(),
    prisma.verificationRequest.count({ where: { status: "APPROVED" } }),
    prisma.review.count(),
    prisma.review.count({
      where: { moderationStatus: "APPROVED" },
    }),
    prisma.verificationDecision.findMany({
      select: {
        decidedAt: true,
        verificationRequest: { select: { submittedAt: true } },
      },
      orderBy: { decidedAt: "desc" },
      take: 100,
    }),
    prisma.business.count({ where: { isPublished: true } }),
    getAdminNotificationCount(),
    dailyCountsForLastWeek((range) =>
      prisma.verificationRequest.count({
        where: {
          status: "APPROVED",
          reviewedAt: { gte: range.start, lte: range.end },
        },
      }),
    ),
    dailyCountsForLastWeek((range) =>
      prisma.review.count({
        where: {
          moderationStatus: "APPROVED",
          updatedAt: { gte: range.start, lte: range.end },
        },
      }),
    ),
    dailyCountsForLastWeek((range) =>
      prisma.business.count({
        where: { createdAt: { gte: range.start, lte: range.end } },
      }),
    ),
    dailyCountsForLastWeek(async (range) => {
      const decisions = await prisma.verificationDecision.findMany({
        where: { decidedAt: { gte: range.start, lte: range.end } },
        select: {
          decidedAt: true,
          verificationRequest: { select: { submittedAt: true } },
        },
      });

      if (decisions.length === 0) {
        return 0;
      }

      const totalHours = decisions.reduce((sum, decision) => {
        const submitted = decision.verificationRequest.submittedAt.getTime();
        const decided = decision.decidedAt.getTime();
        return sum + (decided - submitted) / (1000 * 60 * 60);
      }, 0);

      return Number((totalHours / decisions.length).toFixed(1));
    }),
  ]);

  const reviewRatingFilters: Prisma.RatingWhereInput[] = [];
  for (const review of recentReviewsRaw) {
    if (review.userId) {
      reviewRatingFilters.push({
        userId: review.userId,
        businessId: review.businessId,
      });
      continue;
    }

    if (review.visitorId) {
      reviewRatingFilters.push({
        visitorId: review.visitorId,
        businessId: review.businessId,
      });
    }
  }

  const reviewRatings =
    reviewRatingFilters.length > 0
      ? await prisma.rating.findMany({
          where: { OR: reviewRatingFilters },
          select: {
            userId: true,
            visitorId: true,
            businessId: true,
            score: true,
          },
        })
      : [];

  const ratingByReviewKey = new Map(
    reviewRatings.flatMap((rating) => {
      const keys = [`business:${rating.businessId}`];
      if (rating.userId) {
        keys.unshift(`user:${rating.userId}:${rating.businessId}`);
      }
      if (rating.visitorId) {
        keys.unshift(`visitor:${rating.visitorId}:${rating.businessId}`);
      }
      return keys.map((key) => [key, Number(rating.score)] as const);
    }),
  );

  const categoryIds = categoryGroups.map((group) => group.categoryId);
  const categories =
    categoryIds.length > 0
      ? await prisma.businessCategory.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];

  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const topCategories: AdminCategorySlice[] = categoryGroups
    .slice(0, 5)
    .map((group, index) => {
      const count = group._count.categoryId;
      return {
        name: categoryNameById.get(group.categoryId) ?? "Uncategorized",
        count,
        percentage: totalBusinesses
          ? Math.round((count / totalBusinesses) * 100)
          : 0,
        color: CATEGORY_COLORS[index] ?? CATEGORY_COLORS[5],
      };
    });

  const categorizedCount = topCategories.reduce(
    (sum, category) => sum + category.count,
    0,
  );
  const otherCount = totalBusinesses - categorizedCount;

  if (otherCount > 0) {
    topCategories.push({
      name: "Other",
      count: otherCount,
      percentage: totalBusinesses
        ? Math.round((otherCount / totalBusinesses) * 100)
        : 0,
      color: CATEGORY_COLORS[5],
    });
  }

  const verificationCompletion =
    totalVerificationRequests > 0
      ? Math.round((approvedVerifications / totalVerificationRequests) * 100)
      : 0;

  const reviewModerationRate =
    totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0;

  const searchableCoverage =
    totalBusinesses > 0
      ? Math.round((publishedBusinesses / totalBusinesses) * 100)
      : 0;

  const avgDecisionHours =
    recentDecisions.length > 0
      ? Number(
          (
            recentDecisions.reduce((sum, decision) => {
              const submitted =
                decision.verificationRequest.submittedAt.getTime();
              const decided = decision.decidedAt.getTime();
              return sum + (decided - submitted) / (1000 * 60 * 60);
            }, 0) / recentDecisions.length
          ).toFixed(1),
        )
      : 0;

  const userTrend = trendPercent(usersThisWeek, usersLastWeek);
  const businessTrend = trendPercent(businessesThisWeek, businessesLastWeek);
  const verificationTrend = trendPercent(
    pendingSubmittedThisWeek,
    pendingSubmittedLastWeek,
  );
  const reviewTrend = trendPercent(flaggedThisWeek, flaggedLastWeek);

  return {
    stats: [
      {
        label: "Users",
        value: totalUsers,
        trend: userTrend,
        trendLabel: "from last week",
        positive: userTrend >= 0,
      },
      {
        label: "Businesses",
        value: totalBusinesses,
        trend: businessTrend,
        trendLabel: "from last week",
        positive: businessTrend >= 0,
      },
      {
        label: "Pending Verifications",
        value: pendingVerifications,
        trend: verificationTrend,
        trendLabel: "from last week",
        positive: verificationTrend <= 0,
      },
      {
        label: "Flagged Reviews",
        value: flaggedReviews,
        trend: reviewTrend,
        trendLabel: "from last week",
        positive: reviewTrend <= 0,
      },
    ],
    verificationQueue: pendingVerificationItems.map((item) => {
      const documentCount = item.business.documents.length;

      return {
        id: item.id,
        businessName: item.business.businessName,
        categoryName: item.business.category?.name ?? "Uncategorized",
        status: item.status === "UNDER_REVIEW" ? "Under Review" : "Pending",
        submittedAt: item.submittedAt,
        documentCount,
        progress: computeVerificationProgress({
          status: item.status,
          documentCount,
          hasDescription: Boolean(item.business.description),
          hasLogo: Boolean(item.business.logoUrl),
        }),
      };
    }),
    recentReviews: recentReviewsRaw.map((review) => {
      const userName = review.user
        ? `${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim() ||
          review.user.email
        : "Guest reviewer";
      const ratingKey = review.userId
        ? `user:${review.userId}:${review.businessId}`
        : review.visitorId
          ? `visitor:${review.visitorId}:${review.businessId}`
          : null;
      const rating = ratingKey
        ? (ratingByReviewKey.get(ratingKey) ?? null)
        : null;

      return {
        id: review.id,
        userName,
        userInitials: initialsFromName(userName),
        businessName: review.business.businessName,
        rating,
        excerpt: review.content.slice(0, 90),
        createdAt: review.createdAt,
        moderationStatus: review.moderationStatus,
      };
    }),
    categories: topCategories,
    platformHealth: [
      {
        label: "Verification completion",
        value: `${verificationCompletion}%`,
        tone: verificationCompletion >= 80 ? "good" : "warn",
        sparkline: verificationApprovalTrend,
      },
      {
        label: "Review moderation",
        value: `${reviewModerationRate}%`,
        tone: reviewModerationRate >= 80 ? "good" : "warn",
        sparkline: reviewApprovalTrend,
      },
      {
        label: "Average response time",
        value: formatHours(avgDecisionHours),
        tone: avgDecisionHours <= 4 ? "good" : "warn",
        sparkline: responseTimeTrend,
      },
      {
        label: "Searchable listings",
        value: `${searchableCoverage}%`,
        tone: searchableCoverage >= 80 ? "good" : "warn",
        sparkline: businessCreationTrend,
      },
    ],
    totalBusinesses,
    notificationCount,
  };
}
