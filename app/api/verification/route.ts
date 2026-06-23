import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin, requireAuth } from "@/lib/auth/auth";
import {
  submitVerificationSchema,
  verificationListQuerySchema,
} from "@/lib/validation/verification";
import {
  listVerificationRequests,
  submitVerificationRequest,
} from "@/lib/verification/workflow";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = verificationListQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const data = await listVerificationRequests(parsed.data);
  return jsonOk(data);
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = submitVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const verificationRequest = await submitVerificationRequest(
      parsed.data.businessId,
      session.user.id,
    );
    return jsonOk(verificationRequest, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Submission failed";
    return jsonError(message, 400);
  }
}
