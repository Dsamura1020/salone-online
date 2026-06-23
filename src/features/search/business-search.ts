import {
  buildBusinessTextSearchWhere,
  publicBusinessWhere,
} from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";

export type SearchResult = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  averageRating: number;
  reviewCount: number;
  categoryName: string;
  city: string;
  url: string;
};

export async function searchBusinesses(
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const businesses = await prisma.business.findMany({
    where: {
      ...publicBusinessWhere,
      ...buildBusinessTextSearchWhere(trimmed),
    },
    select: {
      id: true,
      businessName: true,
      slug: true,
      description: true,
      averageRating: true,
      reviewCount: true,
      category: { select: { name: true } },
      location: { select: { city: true } },
    },
    take: limit,
    orderBy: [
      { averageRating: "desc" },
      { reviewCount: "desc" },
      { businessName: "asc" },
    ],
  });

  return businesses.map((business) => ({
    id: business.id,
    businessName: business.businessName,
    slug: business.slug,
    description: business.description,
    averageRating: Number(business.averageRating),
    reviewCount: business.reviewCount,
    categoryName: business.category.name,
    city: business.location.city,
    url: `/businesses/${business.slug}`,
  }));
}
