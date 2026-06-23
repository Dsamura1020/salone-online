import { jsonError, jsonOk } from "@/lib/api/response";
import { keywordSearch } from "@/features/search/keyword-search";
import { searchPostSchema, searchQuerySchema } from "@/lib/validation/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      minRating: searchParams.get("minRating") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const data = await keywordSearch(parsed.data);
    return jsonOk({
      results: data.results,
      total: data.total,
      page: data.page,
      limit: data.limit,
      hasMore: data.hasMore,
      query: parsed.data.q ?? null,
      filters: {
        userId: parsed.data.userId ?? null,
        categoryId: parsed.data.categoryId ?? null,
        locationId: parsed.data.locationId ?? null,
        status: parsed.data.status ?? null,
        minRating: parsed.data.minRating ?? null,
        sort: parsed.data.sort,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = searchPostSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const data = await keywordSearch(parsed.data);

    return jsonOk({
      results: data.results,
      total: data.total,
      page: data.page,
      limit: data.limit,
      hasMore: data.hasMore,
      query: parsed.data.q ?? null,
      filters: {
        userId: parsed.data.userId ?? null,
        categoryId: parsed.data.categoryId ?? null,
        locationId: parsed.data.locationId ?? null,
        status: parsed.data.status ?? null,
        minRating: parsed.data.minRating ?? null,
        sort: parsed.data.sort,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return jsonError(message, 500);
  }
}
