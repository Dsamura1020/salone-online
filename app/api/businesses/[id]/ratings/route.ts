import { jsonError, jsonOk } from "@/lib/api/response";
import { getSession } from "@/lib/auth/auth";
import { submitRatingSchema } from "@/lib/validation/rating.schema";
import {
  getBusinessRatingForActor,
  submitBusinessRating,
} from "@/services/rating.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;
  const session = await getSession();

  const userId = session?.user?.id;
  if (!userId) {
    return jsonOk({ yourRating: null });
  }

  const yourRating = await getBusinessRatingForActor({
    businessId,
    userId,
  });

  return jsonOk({ yourRating });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;
  const session = await getSession();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = submitRatingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const userId = session?.user?.id;
  if (!userId) {
    return jsonError("Please log in to rate this business", 401);
  }

  try {
    const result = await submitBusinessRating({
      businessId,
      score: parsed.data.score,
      userId,
    });

    return jsonOk({
      ...result,
      yourRating: parsed.data.score,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not submit rating";
    const status = message.includes("owners cannot") ? 403 : 400;
    return jsonError(message, status);
  }
}
