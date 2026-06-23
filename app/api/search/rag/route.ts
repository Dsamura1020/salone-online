import { jsonError, jsonOk } from "@/lib/api/response";
import { searchPostSchema } from "@/lib/validation/search";
import { ragSearch } from "@/features/search/rag";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = searchPostSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const questionCandidate =
      typeof body.question === "string" && body.question.trim().length > 0
        ? body.question
        : parsed.data.q;

    if (!questionCandidate) {
      return jsonError("Question is required", 400);
    }

    const data = await ragSearch(questionCandidate, {
      userId: parsed.data.userId,
      categoryId: parsed.data.categoryId,
      locationId: parsed.data.locationId,
      status: parsed.data.status,
      minRating: parsed.data.minRating,
    });

    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RAG search failed";
    return jsonError(message, 500);
  }
}
