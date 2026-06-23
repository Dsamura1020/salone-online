import { jsonError, jsonOk } from "@/lib/api/response";
import { getSession } from "@/lib/auth/auth";
import {
  deleteBusinessReview,
  editBusinessReview,
} from "@/services/review.service";
import { editReviewSchema } from "@/lib/validation/review";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  const parsed = editReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const review = await editBusinessReview({
      reviewId,
      userId: session.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
    });
    return jsonOk({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update review";
    return jsonError(message, 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError("Authentication required", 401);
  }

  const { id: reviewId } = await context.params;

  try {
    await deleteBusinessReview({ reviewId, userId: session.user.id });
    return jsonOk({ message: "Review deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete review";
    return jsonError(message, 400);
  }
}
