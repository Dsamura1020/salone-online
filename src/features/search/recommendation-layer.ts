import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import type {
  SimilarRecommendationQueryInput,
  SuggestedRecommendationQueryInput,
  TrendingRecommendationQueryInput,
} from "@/lib/validation/recommendation";

export type RecommendationResultItem = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  categoryName: string;
  location: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  recommendationScore: number;
  personalizedScore: number;
  url: string;
};

export type RecommendationResult = {
  results: RecommendationResultItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type UserPreferenceProfile = {
  categoryWeights: Map<string, number>;
  locationWeights: Map<string, number>;
  ratedBusinessIds: Set<string>;
};

type RecommendationRow = {
  id: string;
  categoryId: string;
  locationId: string;
  businessName: string;
  slug: string;
  description: string | null;
  categoryName: string;
  city: string;
  stateProvince: string | null;
  country: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  recommendationScore: number;
  createdAt: Date;
};

function normalizeWeightMap(
  entries: Array<[string, number]>,
): Map<string, number> {
  const max = Math.max(1, ...entries.map(([, score]) => score));
  return new Map(entries.map(([id, score]) => [id, Number((score / max).toFixed(4))]));
}

function baseQualityScore(rating: number, reviewCount: number) {
  const ratingPart = Math.min(rating / 5, 1);
  const reviewPart = Math.min(Math.log1p(reviewCount) / Math.log(201), 1);
  return Number((ratingPart * 0.65 + reviewPart * 0.35).toFixed(4));
}

function profileBoost(
  profile: UserPreferenceProfile | null,
  categoryId: string,
  locationId: string,
) {
  if (!profile) {
    return 0;
  }

  const categoryScore = profile.categoryWeights.get(categoryId) ?? 0;
  const locationScore = profile.locationWeights.get(locationId) ?? 0;
  return Number((categoryScore * 0.6 + locationScore * 0.4).toFixed(4));
}

export async function getUserPreferenceProfile(
  userId?: string,
): Promise<UserPreferenceProfile | null> {
  if (!userId) {
    return null;
  }

  const ratings = await prisma.rating.findMany({
    where: { userId },
    select: {
      score: true,
      businessId: true,
      business: {
        select: {
          categoryId: true,
          locationId: true,
        },
      },
    },
  });

  if (ratings.length === 0) {
    return null;
  }

  const categoryScoreById = new Map<string, number>();
  const locationScoreById = new Map<string, number>();

  for (const rating of ratings) {
    const weightedScore = Math.max(0, Number(rating.score) - 2);
    categoryScoreById.set(
      rating.business.categoryId,
      (categoryScoreById.get(rating.business.categoryId) ?? 0) + weightedScore,
    );
    locationScoreById.set(
      rating.business.locationId,
      (locationScoreById.get(rating.business.locationId) ?? 0) + weightedScore,
    );
  }

  return {
    categoryWeights: normalizeWeightMap(Array.from(categoryScoreById.entries())),
    locationWeights: normalizeWeightMap(Array.from(locationScoreById.entries())),
    ratedBusinessIds: new Set(ratings.map((rating) => rating.businessId)),
  };
}

function mapRecommendationRow(
  row: RecommendationRow,
  personalizedScore: number,
): RecommendationResultItem {
  return {
    id: row.id,
    businessName: row.businessName,
    slug: row.slug,
    description: row.description,
    categoryName: row.categoryName,
    location: [row.city, row.stateProvince, row.country]
      .filter((part) => Boolean(part))
      .join(", "),
    verificationStatus: row.verificationStatus,
    isVerified: row.isVerified,
    rating: row.rating,
    reviewCount: row.reviewCount,
    recommendationScore: row.recommendationScore,
    personalizedScore,
    url: `/businesses/${row.slug}`,
  };
}

function toResult(
  rows: RecommendationResultItem[],
  total: number,
  page: number,
  limit: number,
): RecommendationResult {
  return {
    results: rows,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

function buildRecommendationFilters(input: {
  categoryId?: string;
  locationId?: string;
  status?: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  minRating?: number;
}) {
  const filters: Prisma.Sql[] = [Prisma.sql`b."isPublished" = true`];

  if (input.categoryId) {
    filters.push(Prisma.sql`b."categoryId" = ${input.categoryId}`);
  }
  if (input.locationId) {
    filters.push(Prisma.sql`b."locationId" = ${input.locationId}`);
  }
  if (input.status) {
    filters.push(Prisma.sql`b."verificationStatus" = ${input.status}`);
  }
  if (typeof input.minRating === "number") {
    filters.push(Prisma.sql`b."averageRating"::float8 >= ${input.minRating}`);
  }

  return filters;
}

export async function recommendSimilarBusinesses(
  input: SimilarRecommendationQueryInput,
): Promise<RecommendationResult> {
  const { businessId, page, limit } = input;
  const offset = (page - 1) * limit;

  const source = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      categoryId: true,
      locationId: true,
      businessName: true,
      description: true,
    },
  });

  if (!source) {
    return toResult([], 0, page, limit);
  }

  const filters = buildRecommendationFilters(input);
  filters.push(Prisma.sql`b.id <> ${businessId}`);

  const whereSql = Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`;
  const sourceText = `${source.businessName} ${source.description ?? ""}`.trim();

  const rows = await prisma.$queryRaw<RecommendationRow[]>(Prisma.sql`
    SELECT
      b.id,
      b."categoryId",
      b."locationId",
      b."businessName",
      b.slug,
      b.description,
      c.name AS "categoryName",
      l.city,
      l."stateProvince",
      l.country,
      b."verificationStatus",
      b."isVerified",
      b."averageRating"::float8 AS rating,
      b."reviewCount"::int AS "reviewCount",
      (
        CASE WHEN b."categoryId" = ${source.categoryId} THEN 0.45 ELSE 0 END
        + CASE WHEN b."locationId" = ${source.locationId} THEN 0.2 ELSE 0 END
        + (
          ts_rank_cd(
            (
              setweight(to_tsvector('english', COALESCE(b."businessName", '')), 'A')
              || setweight(to_tsvector('english', COALESCE(c.name, '')), 'B')
              || setweight(to_tsvector('english', COALESCE(b.description, '')), 'C')
            ),
            websearch_to_tsquery('english', ${sourceText})
          )::float8
        ) * 0.25
        + LEAST(b."averageRating"::float8 / 5, 1) * 0.1
      )::float8 AS "recommendationScore",
      b."createdAt"
    FROM "Business" b
    INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
    INNER JOIN "Location" l ON l.id = b."locationId"
    ${whereSql}
    ORDER BY "recommendationScore" DESC, b."reviewCount" DESC, b."createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  const countRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS total
    FROM "Business" b
    ${whereSql}
  `);

  const total = Number(countRows[0]?.total ?? 0);
  const mapped = rows.map((row) => mapRecommendationRow(row, row.recommendationScore));
  return toResult(mapped, total, page, limit);
}

export async function recommendTrendingBusinesses(
  input: TrendingRecommendationQueryInput,
): Promise<RecommendationResult> {
  const { page, limit } = input;
  const offset = (page - 1) * limit;
  const filters = buildRecommendationFilters(input);
  const whereSql = Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`;

  const rows = await prisma.$queryRaw<RecommendationRow[]>(Prisma.sql`
    WITH recent_reviews AS (
      SELECT
        r."businessId",
        COUNT(*)::int AS recent_count
      FROM "Review" r
      WHERE
        r."createdAt" >= NOW() - INTERVAL '14 days'
        AND r."isHidden" = false
      GROUP BY r."businessId"
    )
    SELECT
      b.id,
      b."categoryId",
      b."locationId",
      b."businessName",
      b.slug,
      b.description,
      c.name AS "categoryName",
      l.city,
      l."stateProvince",
      l.country,
      b."verificationStatus",
      b."isVerified",
      b."averageRating"::float8 AS rating,
      b."reviewCount"::int AS "reviewCount",
      (
        LEAST(COALESCE(rr.recent_count, 0)::float8 / 20, 1) * 0.5
        + LEAST(b."averageRating"::float8 / 5, 1) * 0.25
        + LEAST(LN(1 + b."reviewCount"::float8) / LN(1 + 200), 1) * 0.15
        + EXP(-GREATEST(EXTRACT(EPOCH FROM (NOW() - b."createdAt")) / 86400, 0) / 90) * 0.1
      )::float8 AS "recommendationScore",
      b."createdAt"
    FROM "Business" b
    INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
    INNER JOIN "Location" l ON l.id = b."locationId"
    LEFT JOIN recent_reviews rr ON rr."businessId" = b.id
    ${whereSql}
    ORDER BY "recommendationScore" DESC, b."reviewCount" DESC, b."createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  const countRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS total
    FROM "Business" b
    ${whereSql}
  `);

  const total = Number(countRows[0]?.total ?? 0);
  const mapped = rows.map((row) => mapRecommendationRow(row, row.recommendationScore));
  return toResult(mapped, total, page, limit);
}

export async function recommendSuggestedBusinesses(
  input: SuggestedRecommendationQueryInput,
): Promise<RecommendationResult> {
  const { page, limit, userId } = input;
  const offset = (page - 1) * limit;
  const filters = buildRecommendationFilters(input);
  const whereSql = Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`;

  const profile = await getUserPreferenceProfile(userId);
  const candidateLimit = Math.min(Math.max(limit * 4, 30), 200);
  const candidateOffset = Math.min(offset, 200);

  const rows = await prisma.$queryRaw<RecommendationRow[]>(Prisma.sql`
    WITH recent_reviews AS (
      SELECT
        r."businessId",
        COUNT(*)::int AS recent_count
      FROM "Review" r
      WHERE
        r."createdAt" >= NOW() - INTERVAL '14 days'
        AND r."isHidden" = false
      GROUP BY r."businessId"
    )
    SELECT
      b.id,
      b."categoryId",
      b."locationId",
      b."businessName",
      b.slug,
      b.description,
      c.name AS "categoryName",
      l.city,
      l."stateProvince",
      l.country,
      b."verificationStatus",
      b."isVerified",
      b."averageRating"::float8 AS rating,
      b."reviewCount"::int AS "reviewCount",
      (
        LEAST(COALESCE(rr.recent_count, 0)::float8 / 20, 1) * 0.4
        + LEAST(b."averageRating"::float8 / 5, 1) * 0.4
        + LEAST(LN(1 + b."reviewCount"::float8) / LN(1 + 200), 1) * 0.2
      )::float8 AS "recommendationScore",
      b."createdAt"
    FROM "Business" b
    INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
    INNER JOIN "Location" l ON l.id = b."locationId"
    LEFT JOIN recent_reviews rr ON rr."businessId" = b.id
    ${whereSql}
    ORDER BY "recommendationScore" DESC, b."createdAt" DESC
    LIMIT ${candidateLimit}
    OFFSET ${candidateOffset}
  `);

  const countRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS total
    FROM "Business" b
    ${whereSql}
  `);

  const personalized = rows
    .filter((row) => !profile?.ratedBusinessIds.has(row.id))
    .map((row) => {
      const personalizedScore = Number(
        (
          row.recommendationScore * 0.7 +
          baseQualityScore(row.rating, row.reviewCount) * 0.2 +
          profileBoost(profile, row.categoryId, row.locationId) * 0.1
        ).toFixed(4),
      );
      return mapRecommendationRow(row, personalizedScore);
    })
    .sort((left, right) => right.personalizedScore - left.personalizedScore)
    .slice(0, limit);

  const total = Number(countRows[0]?.total ?? 0);
  return toResult(personalized, total, page, limit);
}
