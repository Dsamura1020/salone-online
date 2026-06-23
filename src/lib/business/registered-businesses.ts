import {
  buildBusinessTextSearchWhere,
  publicBusinessWhere,
  verifiedBusinessWhere,
} from "@/lib/business/public-visibility";
import {
  fetchLiveAverageRatings,
  filterSortTopRated,
  resolveEffectiveAverageRating,
} from "@/lib/business/top-rated-filter";
import { prisma } from "@/lib/prisma/prisma";
import {
  BUSINESS_FALLBACK_IMAGES,
  type RegisteredBusiness,
} from "@/lib/business/registered-business-types";

export type { RegisteredBusiness } from "@/lib/business/registered-business-types";
export { formatBusinessLocation, BUSINESS_FALLBACK_IMAGES } from "@/lib/business/registered-business-types";

type BusinessRecord = {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  description: string | null;
  averageRating: { toString(): string } | number;
  reviewCount: number;
  isVerified: boolean;
  logoUrl: string | null;
  coverImageUrl: string | null;
  category: { name: string };
  location: {
    city: string;
    stateProvince: string | null;
    country: string;
  };
};

function mapRegisteredBusiness(
  business: BusinessRecord,
  index = 0,
): RegisteredBusiness {
  return {
    id: business.id,
    ownerId: business.ownerId,
    businessName: business.businessName,
    slug: business.slug,
    description: business.description,
    averageRating: Number(business.averageRating),
    reviewCount: business.reviewCount,
    ratingCount: 0,
    isVerified: business.isVerified,
    categoryName: business.category.name,
    city: business.location.city,
    stateProvince: business.location.stateProvince,
    country: business.location.country,
    imageUrl:
      business.coverImageUrl ??
      business.logoUrl ??
      BUSINESS_FALLBACK_IMAGES[index % BUSINESS_FALLBACK_IMAGES.length],
  };
}

const businessSelect = {
  id: true,
  ownerId: true,
  businessName: true,
  slug: true,
  description: true,
  averageRating: true,
  reviewCount: true,
  isVerified: true,
  logoUrl: true,
  coverImageUrl: true,
  category: { select: { name: true } },
  location: {
    select: { city: true, stateProvince: true, country: true },
  },
} as const;

async function attachRatingCounts(
  businesses: BusinessRecord[],
  liveAverages?: Map<string, number>,
): Promise<RegisteredBusiness[]> {
  if (businesses.length === 0) {
    return [];
  }

  const averages =
    liveAverages ??
    (await fetchLiveAverageRatings(businesses.map((business) => business.id)));

  const ratingCounts = await prisma.rating.groupBy({
    by: ["businessId"],
    where: {
      businessId: { in: businesses.map((business) => business.id) },
    },
    _count: { score: true },
  });

  const ratingCountByBusiness = new Map(
    ratingCounts.map((row) => [row.businessId, row._count.score]),
  );

  return businesses.map((business, index) => ({
    ...mapRegisteredBusiness(business, index),
    averageRating: resolveEffectiveAverageRating(
      Number(business.averageRating),
      averages.get(business.id),
    ),
    ratingCount: ratingCountByBusiness.get(business.id) ?? 0,
  }));
}

export async function getRegisteredBusinesses(): Promise<RegisteredBusiness[]> {
  const businesses = await prisma.business.findMany({
    where: publicBusinessWhere,
    select: businessSelect,
    orderBy: [
      { averageRating: "desc" },
      { reviewCount: "desc" },
      { businessName: "asc" },
    ],
  });

  return attachRatingCounts(businesses);
}

export async function getTopRatedBusinesses(
  limit = 5,
): Promise<RegisteredBusiness[]> {
  const candidates = await prisma.business.findMany({
    where: publicBusinessWhere,
    select: businessSelect,
    orderBy: [
      { averageRating: "desc" },
      { reviewCount: "desc" },
      { businessName: "asc" },
    ],
    take: Math.max(limit * 10, 50),
  });

  const liveAverages = await fetchLiveAverageRatings(
    candidates.map((business) => business.id),
  );
  const businesses = filterSortTopRated(candidates, liveAverages, limit);

  return attachRatingCounts(businesses, liveAverages);
}

export async function getVerifiedBusinesses(): Promise<RegisteredBusiness[]> {
  const businesses = await prisma.business.findMany({
    where: verifiedBusinessWhere,
    select: businessSelect,
    orderBy: [
      { averageRating: "desc" },
      { reviewCount: "desc" },
      { businessName: "asc" },
    ],
  });

  return attachRatingCounts(businesses);
}

export async function searchTopRatedBusinesses(
  query: string,
  limit = 10,
): Promise<RegisteredBusiness[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = await prisma.business.findMany({
    where: {
      ...publicBusinessWhere,
      ...buildBusinessTextSearchWhere(trimmed),
    },
    select: businessSelect,
    orderBy: [
      { averageRating: "desc" },
      { reviewCount: "desc" },
      { businessName: "asc" },
    ],
    take: Math.max(limit * 10, 50),
  });

  const liveAverages = await fetchLiveAverageRatings(
    candidates.map((business) => business.id),
  );
  const businesses = filterSortTopRated(candidates, liveAverages, limit);

  return attachRatingCounts(businesses, liveAverages);
}
