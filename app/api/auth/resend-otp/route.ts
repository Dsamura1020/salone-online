import { jsonError, jsonOk } from "@/lib/api/response";
import { prisma } from "@/lib/prisma/prisma";
import { createAndSendEmailOtp } from "@/lib/email/otp";
import { verifyCsrfToken } from "@/lib/security/csrf";
import { normalizeEmail } from "@/lib/security/sanitize";
import { resendOtpSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return jsonError("Invalid security token", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = resendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    return jsonError("No pending verification found", 404);
  }

  await createAndSendEmailOtp(email);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      entityType: "User",
      entityId: user.id,
      action: "EMAIL_OTP_RESENT",
      newValues: { email },
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return jsonOk({ sent: true });
}
