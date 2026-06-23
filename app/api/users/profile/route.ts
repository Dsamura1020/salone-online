import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { updateUserProfileSchema } from "@/lib/validation/user.schema";

export async function PATCH(request: Request) {
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

  const parsed = updateUserProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      username: parsed.data.username,
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });

  if (existingUsername) {
    return jsonError("Username is already in use", 409);
  }

  const firstName = sanitizePlainText(parsed.data.firstName);
  const lastName = sanitizePlainText(parsed.data.lastName);
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      username: parsed.data.username,
      phone: parsed.data.phone
        ? sanitizePlainText(parsed.data.phone)
        : null,
      timezone: parsed.data.timezone
        ? sanitizePlainText(parsed.data.timezone)
        : null,
      locale: parsed.data.locale
        ? sanitizePlainText(parsed.data.locale)
        : null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      timezone: true,
      locale: true,
      image: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: updated.id,
      entityType: "User",
      entityId: updated.id,
      action: "PROFILE_UPDATED",
      newValues: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
      },
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  return jsonOk(updated);
}
