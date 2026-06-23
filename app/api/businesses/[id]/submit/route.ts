import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { submitBusinessForVerification } from "@/lib/business/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await context.params;

  try {
    const result = await submitBusinessForVerification(id, session.user.id);
    return jsonOk(result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification submission failed";
    return jsonError(message, 400);
  }
}
