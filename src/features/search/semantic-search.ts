import {
  searchBusinesses,
  type SearchResult,
} from "./business-search";

export type { SearchResult };

export async function semanticSearch(
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  return searchBusinesses(query, limit);
}
