import bcrypt from "bcryptjs";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { verifyPasswordChangeOtp } from "@/lib/email/otp";
import { prisma } from "@/lib/prisma/prisma";
import { confirmPasswordChangeSchema } from "@/lib/validation/user.schema";

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session?.user?.id || !session.user.email) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = confirmPasswordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const valid = await verifyPasswordChangeOtp(
    session.user.email,
    parsed.data.otp,
  );

  if (!valid) {
    return jsonError("Invalid or expired password change code", 400);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      entityType: "User",
      entityId: session.user.id,
      action: "PASSWORD_CHANGED",
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return jsonOk({ changed: true });
}
