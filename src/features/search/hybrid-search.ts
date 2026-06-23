import { keywordSearch } from "./keyword-search";
import { semanticSearch } from "./semantic-search";

export async function hybridSearch(query: string, limit = 10) {
  const [web, businesses] = await Promise.all([
    semanticSearch(query, limit),
    keywordSearch({
      q: query,
      sort: "relevance",
      page: 1,
      limit,
    }),
  ]);

  return {
    web,
    businesses: businesses.results,
  };
}
