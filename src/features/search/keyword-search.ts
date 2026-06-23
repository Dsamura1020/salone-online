import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import type { SearchQueryInput } from "@/lib/validation/search";
import { getUserPreferenceProfile } from "./recommendation-layer";

type RawSearchRow = {
  id: string;
  ownerId: string;
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
  relevance: number;
  createdAt: Date;
};

type RawCountRow = { total: bigint | number };

export type KeywordSearchResultItem = {
  id: string;
  ownerId: string;
  categoryId: string;
  locationId: string;
  businessName: string;
  slug: string;
  description: string | null;
  categoryName: string;
  location: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  relevance: number;
  recommendationScore: number;
  personalizedScore: number;
  url: string;
};

export type KeywordSearchResult = {
  results: KeywordSearchResultItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function buildSortSql(sort: SearchQueryInput["sort"], hasQuery: boolean) {
  if (sort === "rating") {
    return Prisma.sql`ORDER BY rating DESC, relevance DESC, "createdAt" DESC`;
  }

  if (sort === "newest") {
    return Prisma.sql`ORDER BY "createdAt" DESC, relevance DESC`;
  }

  if (!hasQuery) {
    return Prisma.sql`ORDER BY rating DESC, "reviewCount" DESC, "createdAt" DESC`;
  }

  return Prisma.sql`ORDER BY relevance DESC, rating DESC, "reviewCount" DESC, "createdAt" DESC`;
}

export async function keywordSearch(input: SearchQueryInput): Promise<KeywordSearchResult> {
  const { q, userId, categoryId, locationId, status, minRating, sort, page, limit } = input;
  const offset = (page - 1) * limit;
  const hasQuery = Boolean(q);
  const candidateLimit = sort === "relevance" ? Math.min(limit * 3, 150) : limit;

  const tsQuerySql = hasQuery
    ? Prisma.sql`websearch_to_tsquery('english', ${q!})`
    : Prisma.sql`NULL`;
  const likeQuery = hasQuery ? `%${q!}%` : "";

  const filters: Prisma.Sql[] = [];

  if (categoryId) {
    filters.push(Prisma.sql`b."categoryId" = ${categoryId}`);
  }
  if (locationId) {
    filters.push(Prisma.sql`b."locationId" = ${locationId}`);
  }
  if (status) {
    filters.push(Prisma.sql`b."verificationStatus" = ${status}`);
  } else {
    filters.push(Prisma.sql`b."verificationStatus" = 'APPROVED'`);
  }
  if (typeof minRating === "number") {
    filters.push(Prisma.sql`b."averageRating"::float8 >= ${minRating}`);
  }

  const baseWhereSql =
    filters.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
      : Prisma.sql``;

  const queryMatchSql = hasQuery
    ? Prisma.sql`(
        search_document @@ ${tsQuerySql}
        OR "businessName" ILIKE ${likeQuery}
        OR "categoryName" ILIKE ${likeQuery}
        OR city ILIKE ${likeQuery}
        OR COALESCE("stateProvince", '') ILIKE ${likeQuery}
        OR country ILIKE ${likeQuery}
        OR COALESCE(description, '') ILIKE ${likeQuery}
      )`
    : Prisma.sql`TRUE`;

  const rankSql = hasQuery
    ? Prisma.sql`ts_rank_cd(search_document, ${tsQuerySql})::float8`
    : Prisma.sql`0::float8`;

  const sortSql = buildSortSql(sort, hasQuery);

  const rows = await prisma.$queryRaw<RawSearchRow[]>(Prisma.sql`
    WITH searchable AS (
      SELECT
        b.id,
        b."ownerId",
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
        b."createdAt",
        (
          setweight(to_tsvector('english', COALESCE(b."businessName", '')), 'A')
          || setweight(to_tsvector('english', COALESCE(c.name, '')), 'B')
          || setweight(
            to_tsvector(
              'english',
              COALESCE(l.city, '') || ' ' || COALESCE(l."stateProvince", '') || ' ' || COALESCE(l.country, '')
            ),
            'B'
          )
          || setweight(to_tsvector('english', COALESCE(b.description, '')), 'C')
        ) AS search_document
      FROM "Business" b
      INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
      INNER JOIN "Location" l ON l.id = b."locationId"
      ${baseWhereSql}
    )
    SELECT
      id,
      "ownerId",
      "categoryId",
      "locationId",
      "businessName",
      slug,
      description,
      "categoryName",
      city,
      "stateProvince",
      country,
      "verificationStatus",
      "isVerified",
      rating,
      "reviewCount",
      ${rankSql} AS relevance,
      "createdAt"
    FROM searchable
    WHERE ${queryMatchSql}
    ${sortSql}
    LIMIT ${candidateLimit}
    OFFSET ${offset}
  `);

  const totalRows = await prisma.$queryRaw<RawCountRow[]>(Prisma.sql`
    WITH searchable AS (
      SELECT
        b."businessName",
        b.description,
        c.name AS "categoryName",
        l.city,
        l."stateProvince",
        l.country,
        (
          setweight(to_tsvector('english', COALESCE(b."businessName", '')), 'A')
          || setweight(to_tsvector('english', COALESCE(c.name, '')), 'B')
          || setweight(
            to_tsvector(
              'english',
              COALESCE(l.city, '') || ' ' || COALESCE(l."stateProvince", '') || ' ' || COALESCE(l.country, '')
            ),
            'B'
          )
          || setweight(to_tsvector('english', COALESCE(b.description, '')), 'C')
        ) AS search_document
      FROM "Business" b
      INNER JOIN "BusinessCategory" c ON c.id = b."categoryId"
      INNER JOIN "Location" l ON l.id = b."locationId"
      ${baseWhereSql}
    )
    SELECT COUNT(*)::bigint AS total
    FROM searchable
    WHERE ${queryMatchSql}
  `);

  const total = Number(totalRows[0]?.total ?? 0);
  const profile = await getUserPreferenceProfile(userId);

  const scoredRows = rows
    .map((row) => {
      const ratingScore = Math.min(row.rating / 5, 1);
      const reviewScore = Math.min(Math.log1p(row.reviewCount) / Math.log(201), 1);
      const recommendationScore = Number(
        (ratingScore * 0.65 + reviewScore * 0.35).toFixed(4),
      );

      const categoryBoost = profile?.categoryWeights.get(row.categoryId) ?? 0;
      const locationBoost = profile?.locationWeights.get(row.locationId) ?? 0;
      const personalizationBoost = Number(
        (categoryBoost * 0.6 + locationBoost * 0.4).toFixed(4),
      );

      const personalizedScore = Number(
        (
          row.relevance * 0.7 +
          recommendationScore * 0.2 +
          personalizationBoost * 0.1
        ).toFixed(4),
      );

      return {
        ...row,
        recommendationScore,
        personalizedScore,
      };
    })
    .sort((left, right) => {
      if (sort === "rating") {
        return right.rating - left.rating || right.relevance - left.relevance;
      }
      if (sort === "newest") {
        return right.createdAt.getTime() - left.createdAt.getTime();
      }
      return (
        right.personalizedScore - left.personalizedScore ||
        right.relevance - left.relevance
      );
    })
    .slice(0, limit);

  return {
    results: scoredRows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      categoryId: row.categoryId,
      locationId: row.locationId,
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
      relevance: row.relevance,
      recommendationScore: row.recommendationScore,
      personalizedScore: row.personalizedScore,
      url: `/businesses/${row.slug}`,
    })),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}
