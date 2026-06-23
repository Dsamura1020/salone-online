import { jsonError, jsonOk } from "@/lib/api/response";
import { getSession } from "@/lib/auth/auth";
import { reportReview } from "@/services/review.service";
import { reportReviewSchema } from "@/lib/validation/review";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError("Authentication required", 401);
  }

  const { id: reviewId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = reportReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const report = await reportReview({
      reviewId,
      reportedById: session.user.id,
      reason: parsed.data.reason,
    });
    return jsonOk({ report }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit report";
    return jsonError(message, 400);
  }
}
