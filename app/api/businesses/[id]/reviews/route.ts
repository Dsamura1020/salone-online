import { jsonError, jsonOk } from "@/lib/api/response";
import { getSession } from "@/lib/auth/auth";
import { publicBusinessWhere } from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";
import { submitReviewSchema } from "@/lib/validation/review";
import {
  listPublicBusinessReviews,
  submitBusinessReview,
} from "@/services/review.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getPublicBusiness(businessId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, ...publicBusinessWhere },
    select: { id: true, businessName: true, slug: true },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;

  const business = await getPublicBusiness(businessId);
  if (!business) {
    return jsonError("Business not found", 404);
  }

  const reviews = await listPublicBusinessReviews(businessId);
  return jsonOk({ reviews, business });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  const { id: businessId } = await context.params;
  const business = await getPublicBusiness(businessId);
  if (!business) {
    return jsonError("Business not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = submitReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const userId = session?.user?.id;
  if (!userId) {
    return jsonError("Please log in to submit a review", 401);
  }

  try {
    const review = await submitBusinessReview({
      userId,
      businessId,
      title: parsed.data.title,
      content: parsed.data.content,
      score: parsed.data.score,
    });

    return jsonOk(
      {
        review,
        message: "Review submitted successfully.",
      },
      201,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit review";
    return jsonError(message, 400);
  }
}
