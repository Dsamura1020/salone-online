import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { getBusinessForOwner, updateBusinessForOwner } from "@/lib/business/service";
import { updateBusinessSchema } from "@/lib/validation/business";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await context.params;
  const business = await getBusinessForOwner(id, session.user.id);
  if (!business) {
    return jsonError("Business not found", 404);
  }

  return jsonOk(business);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateBusinessSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const business = await updateBusinessForOwner(id, session.user.id, parsed.data);
    return jsonOk(business);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Business update failed";
    return jsonError(message, 400);
  }
}
