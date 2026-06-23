import { jsonError, jsonOk } from "@/lib/api/response";
import { prisma } from "@/lib/prisma/prisma";
import { verifyEmailOtp } from "@/lib/email/otp";
import { verifyCsrfToken } from "@/lib/security/csrf";
import { normalizeEmail } from "@/lib/security/sanitize";
import { verifyOtpSchema } from "@/lib/validation/auth";

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

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const email = normalizeEmail(parsed.data.email);
  const valid = await verifyEmailOtp(email, parsed.data.otp);

  if (!valid) {
    return jsonError("Invalid or expired verification code", 400);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date(), isActive: true },
    include: { roles: { include: { role: true } } },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      entityType: "User",
      entityId: user.id,
      action: "EMAIL_VERIFIED",
      newValues: { email },
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return jsonOk({
    verified: true,
    redirectTo: "/dashboard",
    roles: user.roles.map((userRole) => userRole.role.name),
  });
}
