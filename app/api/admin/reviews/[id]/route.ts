import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth";
import { moderateReview } from "@/services/review.service";
import { moderateReviewSchema } from "@/lib/validation/review";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Admin access required", 403);
  }

  const { id: reviewId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = moderateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const review = await moderateReview({
      reviewId,
      moderationStatus: parsed.data.moderationStatus,
      isHidden: parsed.data.isHidden,
    });
    return jsonOk({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not moderate review";
    return jsonError(message, 400);
  }
}
