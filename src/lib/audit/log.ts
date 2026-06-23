import { prisma } from "@/lib/prisma/prisma";

type AuditInput = {
  userId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: unknown;
  newValues?: unknown;
  request?: Request;
};

export async function writeAuditLog(input: AuditInput) {
  const headers = input.request?.headers;

  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      oldValues: input.oldValues ?? undefined,
      newValues: input.newValues ?? undefined,
      ipAddress:
        headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headers?.get("x-real-ip") ??
        undefined,
      userAgent: headers?.get("user-agent") ?? undefined,
    },
  });
}
