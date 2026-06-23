import { TOP_RATED_MAX, TOP_RATED_MIN } from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";

export function isTopRatedScore(score: number): boolean {
  return score >= TOP_RATED_MIN - 0.001 && score <= TOP_RATED_MAX + 0.001;
}

/** Prefer live average from Rating rows when the stored column is stale or zero. */
export function resolveEffectiveAverageRating(
  storedAverage: number,
  liveAverage?: number | null,
): number {
  const live = liveAverage ?? 0;
  if (live > 0) {
    return live;
  }

  return storedAverage;
}

export async function fetchLiveAverageRatings(
  businessIds: string[],
): Promise<Map<string, number>> {
  if (businessIds.length === 0) {
    return new Map();
  }

  const aggregates = await prisma.rating.groupBy({
    by: ["businessId"],
    where: { businessId: { in: businessIds } },
    _avg: { score: true },
  });

  return new Map(
    aggregates.map((row) => [
      row.businessId,
      Number(row._avg.score ?? 0),
    ]),
  );
}

export function filterSortTopRated<T extends { id: string; averageRating: { toString(): string } | number; reviewCount: number }>(
  items: T[],
  liveAverages: Map<string, number>,
  limit: number,
): T[] {
  return items
    .map((item) => ({
      item,
      score: resolveEffectiveAverageRating(
        Number(item.averageRating),
        liveAverages.get(item.id),
      ),
    }))
    .filter(({ score }) => isTopRatedScore(score))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.item.reviewCount - a.item.reviewCount;
    })
    .slice(0, limit)
    .map(({ item }) => item);
}
