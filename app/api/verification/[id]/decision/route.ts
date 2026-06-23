import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth";
import { verificationDecisionSchema } from "@/lib/validation/verification";
import { recordVerificationDecision } from "@/lib/verification/workflow";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { id: verificationRequestId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = verificationDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const decision = await recordVerificationDecision(
      verificationRequestId,
      session.user.id,
      parsed.data.decision,
      parsed.data.comments,
    );
    return jsonOk(decision);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Decision failed";
    return jsonError(message, 400);
  }
}
