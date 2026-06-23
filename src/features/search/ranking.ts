import type { SearchResult } from "./business-search";

export function rankSearchResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((left, right) => {
    if (right.averageRating !== left.averageRating) {
      return right.averageRating - left.averageRating;
    }

    if (right.reviewCount !== left.reviewCount) {
      return right.reviewCount - left.reviewCount;
    }

    return left.businessName.localeCompare(right.businessName);
  });
}

export function mergeSearchResults(results: SearchResult[]): SearchResult[] {
  const byId = new Map<string, SearchResult>();

  for (const result of results) {
    const existing = byId.get(result.id);
    if (
      !existing ||
      result.averageRating > existing.averageRating ||
      (result.averageRating === existing.averageRating &&
        result.reviewCount > existing.reviewCount)
    ) {
      byId.set(result.id, result);
    }
  }

  return rankSearchResults(Array.from(byId.values()));
}
