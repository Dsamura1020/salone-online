import { getRegisteredBusinesses } from "@/lib/business/registered-businesses";
import { publicBusinessWhere } from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";
import { listPublicBusinessReviews } from "@/services/review.service";
import { BUSINESS_FALLBACK_IMAGES } from "@/lib/business/registered-business-types";
import type { RegisteredBusiness } from "@/lib/business/registered-business-types";
import {
  businessInitials,
  type BusinessSummary,
  type SavedBusiness,
} from "@/features/users/services/dashboard-data";

const businessSelect = {
  id: true,
  businessName: true,
  slug: true,
  description: true,
  averageRating: true,
  reviewCount: true,
  isVerified: true,
  verificationStatus: true,
  logoUrl: true,
  coverImageUrl: true,
  category: { select: { name: true } },
  location: { select: { city: true, stateProvince: true } },
} as const;

type BusinessRecord = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  averageRating: { toString(): string } | number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  category: { name: string };
  location: { city: string; stateProvince: string | null };
};

export type MemberDashboardStats = {
  myBusinessesCount: number;
  verifiedCount: number;
  pendingCount: number;
  totalReviews: number;
  averageRatingLabel: string;
  profileViewsLabel: string;
};

export type MemberActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "green" | "orange" | "navy" | "slate" | "purple" | "red";
};

export type MemberReviewRow = {
  id: string;
  title: string;
  content: string;
  moderationStatus: string;
  createdAt: Date;
  businessName: string;
  businessSlug: string;
  score: number | null;
};

export type MemberDashboardData = {
  stats: MemberDashboardStats;
  notificationCount: number;
  profile: MemberProfile;
  registeredBusinesses: RegisteredBusiness[];
  businesses: BusinessSummary[];
  savedBusinesses: SavedBusiness[];
  savedBusinessIds: string[];
  activity: MemberActivityItem[];
  reviews: MemberReviewRow[];
};

export type MemberProfile = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  timezone: string | null;
  locale: string | null;
  image: string | null;
};

export type MemberReviewBusiness = {
  id: string;
  slug: string;
  businessName: string;
  ownerId: string;
  averageRating: number;
  reviewCount: number;
  description: string | null;
  categoryName: string;
  city: string;
  stateProvince: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  reviews: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorName: string;
    authorId: string | null;
    score: number | null;
  }[];
};

function formatCompactCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return value.toLocaleString();
}

function mapBusinessToSaved(
  business: BusinessRecord,
  index: number,
): SavedBusiness {
  const rating = Number(business.averageRating);

  return {
    id: business.id,
    slug: business.slug,
    name: business.businessName,
    initials: businessInitials(business.businessName),
    category: business.category.name,
    location:
      business.location.city ||
      business.location.stateProvince ||
      "Sierra Leone",
    rating: rating > 0 ? rating.toFixed(1) : "—",
    reviewCount: String(business.reviewCount),
    description:
      business.description ??
      "Discover services and connect with this business on SaloneOnline.",
    isVerified:
      business.isVerified || business.verificationStatus === "APPROVED",
    imageUrl:
      business.coverImageUrl ??
      business.logoUrl ??
      BUSINESS_FALLBACK_IMAGES[index % BUSINESS_FALLBACK_IMAGES.length],
  };
}

function savedToBusinessSummary(
  saved: SavedBusiness,
  index: number,
): BusinessSummary {
  const status: BusinessSummary["status"] = saved.isVerified
    ? "verified"
    : "pending_review";

  return {
    id: saved.id,
    slug: saved.slug,
    imageUrl: saved.imageUrl ?? BUSINESS_FALLBACK_IMAGES[index % BUSINESS_FALLBACK_IMAGES.length],
    name: saved.name,
    initials: saved.initials,
    category: saved.category,
    location: saved.location,
    status,
    views: formatCompactCount(Number(saved.reviewCount) || 0),
    leads: String(index + 1),
    rating: saved.rating,
    reviewCount: saved.reviewCount,
    description: saved.description,
  };
}

function formatAuditTitle(action: string, entityType: string): string {
  if (action === "EMAIL_VERIFIED") {
    return "Email verified";
  }
  if (action === "USER_REGISTERED") {
    return "Account created";
  }
  if (entityType === "Business") {
    return "Business profile updated";
  }

  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAuditDescription(action: string): string {
  if (action === "EMAIL_VERIFIED") {
    return "Your business verification was approved";
  }
  if (action === "USER_REGISTERED") {
    return "Welcome to AI Business Directory";
  }

  return "Latest platform updates for your account";
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
}

export async function getMemberReviewBusiness(
  slug: string,
): Promise<MemberReviewBusiness | null> {
  const business = await prisma.business.findFirst({
    where: { slug, ...publicBusinessWhere },
    select: {
      id: true,
      slug: true,
      businessName: true,
      ownerId: true,
      averageRating: true,
      reviewCount: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      category: { select: { name: true } },
      location: {
        select: { city: true, stateProvince: true, country: true },
      },
    },
  });

  if (!business) {
    return null;
  }

  const reviews = await listPublicBusinessReviews(business.id);

  return {
    id: business.id,
    slug: business.slug,
    businessName: business.businessName,
    ownerId: business.ownerId,
    averageRating: Number(business.averageRating),
    reviewCount: business.reviewCount,
    description: business.description,
    categoryName: business.category.name,
    city: business.location.city,
    stateProvince: business.location.stateProvince,
    country: business.location.country,
    phone: business.phone,
    email: business.email,
    website: business.website,
    reviews: reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      authorName: review.authorName,
      authorId: review.authorId ?? null,
      score: review.score != null ? Number(review.score) : null,
    })),
  };
}

export async function getMemberDashboardData(
  userId: string,
): Promise<MemberDashboardData> {
  const [
    user,
    reviews,
    ratings,
    savedBusinessRecords,
    auditLogs,
    registeredBusinesses,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        timezone: true,
        locale: true,
        image: true,
      },
    }),
    prisma.review.findMany({
      where: { userId },
      include: { business: { select: businessSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rating.findMany({
      where: { userId },
      include: { business: { select: businessSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedBusiness.findMany({
      where: { userId },
      include: { business: { select: businessSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getRegisteredBusinesses(),
  ]);

  const savedBusinesses = savedBusinessRecords.map((saved, index) =>
    mapBusinessToSaved(saved.business, index),
  );
  const savedBusinessIds = savedBusinessRecords.map((saved) => saved.businessId);
  const businesses = savedBusinesses.map((saved, i) =>
    savedToBusinessSummary(saved, i),
  );

  const verifiedCount = savedBusinesses.filter((b) => b.isVerified).length;
  const pendingCount = savedBusinesses.length - verifiedCount;

  const ratingScores = ratings.map((rating) => Number(rating.score));
  const averageRatingGiven =
    ratingScores.length > 0
      ? ratingScores.reduce((sum, score) => sum + score, 0) / ratingScores.length
      : null;

  const profileViews = registeredBusinesses.reduce(
    (sum, business) => sum + business.reviewCount,
    0,
  );

  const pendingReviewCount = reviews.filter(
    (review) =>
      review.moderationStatus === "PENDING" ||
      review.moderationStatus === "FLAGGED",
  ).length;

  const activityCandidates: (MemberActivityItem & { createdAt: Date })[] = [];

  for (const review of reviews) {
    activityCandidates.push({
      id: `review-${review.id}`,
      title:
        review.moderationStatus === "APPROVED"
          ? "Review published"
          : "Review submitted",
      description:
        review.moderationStatus === "APPROVED"
          ? `Your review for ${review.business.businessName} is live`
          : `Review pending moderation for ${review.business.businessName}`,
      time: formatRelativeTime(review.createdAt),
      tone: review.moderationStatus === "APPROVED" ? "green" : "orange",
      createdAt: review.createdAt,
    });
  }

  for (const rating of ratings) {
    const score = Number(rating.score);
    activityCandidates.push({
      id: `rating-${rating.id}`,
      title: "New rating submitted",
      description: `You rated ${rating.business.businessName} ${score}/5`,
      time: formatRelativeTime(rating.createdAt),
      tone: "navy",
      createdAt: rating.createdAt,
    });
  }

  for (const log of auditLogs) {
    activityCandidates.push({
      id: `audit-${log.id}`,
      title: formatAuditTitle(log.action, log.entityType),
      description: formatAuditDescription(log.action),
      time: formatRelativeTime(log.createdAt),
      tone: log.action === "EMAIL_VERIFIED" ? "green" : "slate",
      createdAt: log.createdAt,
    });
  }

  activityCandidates.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const ratingScoreByBusiness = new Map(
    ratings.map((rating) => [rating.businessId, Number(rating.score)]),
  );

  return {
    stats: {
      myBusinessesCount: savedBusinesses.length,
      verifiedCount,
      pendingCount,
      totalReviews: reviews.length,
      averageRatingLabel:
        averageRatingGiven != null ? averageRatingGiven.toFixed(1) : "—",
      profileViewsLabel: formatCompactCount(profileViews),
    },
    notificationCount: Math.min(pendingReviewCount + pendingCount, 99),
    profile: user,
    registeredBusinesses,
    businesses,
    savedBusinesses,
    savedBusinessIds,
    activity: activityCandidates.slice(0, 6),
    reviews: reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      moderationStatus: review.moderationStatus,
      createdAt: review.createdAt,
      businessName: review.business.businessName,
      businessSlug: review.business.slug,
      score: ratingScoreByBusiness.get(review.businessId) ?? null,
    })),
  };
}
