import { jsonError, jsonOk } from "@/lib/api/response";
import { searchTopRatedBusinesses } from "@/lib/business/registered-businesses";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const businesses = await searchTopRatedBusinesses(
      parsed.data.q,
      parsed.data.limit ?? 10,
    );

    return jsonOk({ businesses, query: parsed.data.q });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return jsonError(message, 500);
  }
}
