import { prisma } from "@/lib/prisma/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateRangeInput = { from?: Date; to?: Date };

export type ReportsKPI = {
  users: { total: number; newThisMonth: number; active: number; inactive: number };
  businesses: {
    total: number;
    newThisMonth: number;
    active: number;
    rejected: number;
  };
  verifications: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  reviews: { total: number; approved: number; pending: number; flagged: number };
};

export type GrowthTrendPoint = {
  month: string;
  newBusinesses: number;
  verifiedBusinesses: number;
  userRegistrations: number;
};

export type CategoryBreakdown = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type LocationBreakdown = {
  city: string;
  count: number;
};

export type VerificationAnalyticsPoint = {
  status: string;
  count: number;
  color: string;
};

export type ReviewsAnalyticsPoint = {
  month: string;
  approved: number;
  pending: number;
  flagged: number;
  rejected: number;
};

export type TopBusiness = {
  id: string;
  rank: number;
  name: string;
  slug: string;
  category: string;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
};

export type ReportInsight = {
  id: string;
  type: "positive" | "warning" | "info";
  icon: "trend" | "location" | "warning" | "star" | "flag";
  text: string;
};

export type ReportsDashboardData = {
  kpi: ReportsKPI;
  growthTrend: GrowthTrendPoint[];
  categoryBreakdown: CategoryBreakdown[];
  locationBreakdown: LocationBreakdown[];
  verificationAnalytics: VerificationAnalyticsPoint[];
  reviewsAnalytics: ReviewsAnalyticsPoint[];
  topBusinesses: TopBusiness[];
  insights: ReportInsight[];
  allCategories: string[];
  /** ISO date strings reflecting the active filter window */
  activeRange: { from: string; to: string };
  allLocations: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfMonth(offsetMonths = 0): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - offsetMonths);
  return d;
}

function endOfMonth(offsetMonths = 0): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setDate(1);
  d.setMonth(d.getMonth() - offsetMonths + 1);
  d.setDate(0);
  return d;
}

function shortMonthName(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offsetMonths);
  return d.toLocaleString("en-US", { month: "short" });
}

const CATEGORY_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#94a3b8",
];

// ─── Helpers for dynamic month range ─────────────────────────────────────────

function monthsInRange(from: Date, to: Date): { label: string; start: Date; end: Date }[] {
  const months: { label: string; start: Date; end: Date }[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const limit = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cursor <= limit && months.length < 12) {
    const mStart = new Date(cursor);
    const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
    months.push({
      label: cursor.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      start: mStart,
      end: mEnd > to ? to : mEnd,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

// ─── Main data function ───────────────────────────────────────────────────────

export async function getReportsDashboardData(
  range?: DateRangeInput,
): Promise<ReportsDashboardData> {
  const now = new Date();
  const monthStart = startOfMonth(0);

  // ── Determine active window ──────────────────────────────────────────────────
  const windowEnd = range?.to ?? now;
  windowEnd.setHours(23, 59, 59, 999);

  // Default: show last 6 months
  const windowStart = range?.from ?? startOfMonth(5);
  windowStart.setHours(0, 0, 0, 0);

  const sixMonthsAgo = windowStart;

  const [
    totalUsers,
    newUsersThisMonth,
    activeUsers,
    totalBusinesses,
    newBusinessesThisMonth,
    activeBusinesses,
    rejectedBusinesses,
    totalVerifications,
    pendingVerifications,
    approvedVerifications,
    rejectedVerifications,
    totalReviews,
    approvedReviews,
    pendingReviews,
    flaggedReviews,
    categoryGroups,
    locationGroups,
    topBizRaw,
    allCategoryNames,
    allLocationCities,
    recentBusinesses,
    recentUsers,
    recentReviews6mo,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.business.count({
      where: { isPublished: true, verificationStatus: "APPROVED" },
    }),
    prisma.business.count({ where: { verificationStatus: "REJECTED" } }),
    prisma.verificationRequest.count(),
    prisma.verificationRequest.count({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    }),
    prisma.verificationRequest.count({ where: { status: "APPROVED" } }),
    prisma.verificationRequest.count({ where: { status: "REJECTED" } }),
    prisma.review.count(),
    prisma.review.count({ where: { moderationStatus: "APPROVED" } }),
    prisma.review.count({ where: { moderationStatus: "PENDING" } }),
    prisma.review.count({ where: { moderationStatus: "FLAGGED" } }),
    prisma.business.groupBy({
      by: ["categoryId"],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 8,
    }),
    prisma.business.findMany({
      select: { location: { select: { city: true } } },
      where: { verificationStatus: "APPROVED" },
    }),
    prisma.business.findMany({
      select: {
        id: true,
        businessName: true,
        slug: true,
        averageRating: true,
        reviewCount: true,
        verificationStatus: true,
        category: { select: { name: true } },
      },
      orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
      take: 10,
    }),
    prisma.businessCategory.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.business.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, verificationStatus: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.review.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, moderationStatus: true },
    }),
  ]);

  // ── Category breakdown ──────────────────────────────────────────────────────
  const categoryIds = categoryGroups.map((g) => g.categoryId);
  const categoryRecords =
    categoryIds.length > 0
      ? await prisma.businessCategory.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];

  const catNameById = new Map(categoryRecords.map((c) => [c.id, c.name]));
  const totalForCat = categoryGroups.reduce((s, g) => s + g._count.categoryId, 0);

  const categoryBreakdown: CategoryBreakdown[] = categoryGroups.map((g, i) => ({
    name: catNameById.get(g.categoryId) ?? "Uncategorized",
    count: g._count.categoryId,
    percentage:
      totalForCat > 0 ? Math.round((g._count.categoryId / totalForCat) * 100) : 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] ?? "#94a3b8",
  }));

  // ── Location breakdown ──────────────────────────────────────────────────────
  const cityCounts = new Map<string, number>();
  for (const b of locationGroups) {
    const city = b.location?.city ?? "Unknown";
    cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
  }
  const locationBreakdown: LocationBreakdown[] = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));

  // ── Growth trend (dynamic window) ───────────────────────────────────────────
  const trendMonths = monthsInRange(windowStart, windowEnd);

  const growthTrend: GrowthTrendPoint[] = trendMonths.map(({ label, start, end }) => ({
    month: label,
    newBusinesses: recentBusinesses.filter(
      (b) => b.createdAt >= start && b.createdAt <= end,
    ).length,
    verifiedBusinesses: recentBusinesses.filter(
      (b) =>
        b.createdAt >= start &&
        b.createdAt <= end &&
        b.verificationStatus === "APPROVED",
    ).length,
    userRegistrations: recentUsers.filter(
      (u) => u.createdAt >= start && u.createdAt <= end,
    ).length,
  }));

  // ── Reviews analytics (dynamic window) ─────────────────────────────────────
  const reviewsAnalytics: ReviewsAnalyticsPoint[] = trendMonths.map(
    ({ label, start, end }) => {
      const monthReviews = recentReviews6mo.filter(
        (r) => r.createdAt >= start && r.createdAt <= end,
      );
      return {
        month: label,
        approved: monthReviews.filter((r) => r.moderationStatus === "APPROVED").length,
        pending: monthReviews.filter((r) => r.moderationStatus === "PENDING").length,
        flagged: monthReviews.filter((r) => r.moderationStatus === "FLAGGED").length,
        rejected: monthReviews.filter((r) => r.moderationStatus === "REJECTED").length,
      };
    },
  );

  // ── Verification analytics ──────────────────────────────────────────────────
  const verificationAnalytics: VerificationAnalyticsPoint[] = [
    { status: "Pending", count: pendingVerifications, color: "#f59e0b" },
    { status: "Approved", count: approvedVerifications, color: "#10b981" },
    {
      status: "Rejected",
      count: rejectedVerifications,
      color: "#ef4444",
    },
    {
      status: "Under Review",
      count: Math.max(
        0,
        totalVerifications - pendingVerifications - approvedVerifications - rejectedVerifications,
      ),
      color: "#6366f1",
    },
  ];

  // ── Top businesses ──────────────────────────────────────────────────────────
  const topBusinesses: TopBusiness[] = topBizRaw.map((b, i) => ({
    id: b.id,
    rank: i + 1,
    name: b.businessName,
    slug: b.slug,
    category: b.category.name,
    rating: Number(b.averageRating),
    reviewCount: b.reviewCount,
    verificationStatus: b.verificationStatus,
  }));

  // ── Insights ────────────────────────────────────────────────────────────────
  const insights: ReportInsight[] = [];

  if (newBusinessesThisMonth > 0) {
    insights.push({
      id: "new-biz",
      type: "positive",
      icon: "trend",
      text: `${newBusinessesThisMonth} new business${newBusinessesThisMonth > 1 ? "es" : ""} registered this month.`,
    });
  }

  if (categoryBreakdown.length > 0) {
    insights.push({
      id: "top-category",
      type: "info",
      icon: "star",
      text: `${categoryBreakdown[0]?.name ?? "Technology"} is the most listed category at ${categoryBreakdown[0]?.percentage ?? 0}%.`,
    });
  }

  if (locationBreakdown.length > 0) {
    insights.push({
      id: "top-location",
      type: "info",
      icon: "location",
      text: `${locationBreakdown[0]?.city ?? "Freetown"} has the highest business registration count.`,
    });
  }

  if (pendingVerifications > 5) {
    insights.push({
      id: "pending-verif",
      type: "warning",
      icon: "warning",
      text: `${pendingVerifications} businesses require verification attention.`,
    });
  }

  if (flaggedReviews > 0) {
    insights.push({
      id: "flagged-reviews",
      type: "warning",
      icon: "flag",
      text: `${flaggedReviews} review${flaggedReviews > 1 ? "s" : ""} flagged and awaiting moderation.`,
    });
  }

  if (topBusinesses.length > 0 && topBusinesses[0]) {
    insights.push({
      id: "top-rated",
      type: "positive",
      icon: "star",
      text: `${topBusinesses[0].name} is the top-rated business with ${topBusinesses[0].rating.toFixed(1)}/5 stars.`,
    });
  }

  return {
    kpi: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        active: activeUsers,
        inactive: Math.max(0, totalUsers - activeUsers),
      },
      businesses: {
        total: totalBusinesses,
        newThisMonth: newBusinessesThisMonth,
        active: activeBusinesses,
        rejected: rejectedBusinesses,
      },
      verifications: {
        pending: pendingVerifications,
        approved: approvedVerifications,
        rejected: rejectedVerifications,
        total: totalVerifications,
      },
      reviews: {
        total: totalReviews,
        approved: approvedReviews,
        pending: pendingReviews,
        flagged: flaggedReviews,
      },
    },
    growthTrend,
    categoryBreakdown,
    locationBreakdown,
    verificationAnalytics,
    reviewsAnalytics,
    topBusinesses,
    insights,
    allCategories: allCategoryNames.map((c) => c.name),
    allLocations: allLocationCities.map((l) => l.city),
    activeRange: {
      from: windowStart.toISOString().slice(0, 10),
      to: windowEnd.toISOString().slice(0, 10),
    },
  };
}
