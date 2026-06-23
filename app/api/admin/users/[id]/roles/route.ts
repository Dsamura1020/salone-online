/**
 * PUT /api/admin/users/[id]/roles — replace a user's full role set
 */

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { isSuperAdmin } from "@/lib/auth/permissions";

const bodySchema = z.object({
  roleIds: z.array(z.string().uuid("Each roleId must be a valid UUID")).min(1, "At least one role is required"),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const { id } = await params;

  // Cannot change your own roles via this endpoint
  if (id === session.user.id) {
    return jsonError("Cannot modify your own roles", 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const { roleIds } = parsed.data;

  // Verify all provided roleIds exist
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds } },
    select: { id: true, name: true },
  });

  if (roles.length !== roleIds.length) {
    return jsonError("One or more roleIds are invalid", 400);
  }

  // Guard: only a SUPER_ADMIN may assign the SUPER_ADMIN role
  const assigningSuperAdmin = roles.some((r) => r.name === "SUPER_ADMIN");
  if (assigningSuperAdmin && !isSuperAdmin(session.user.roles)) {
    return jsonError("Only a Super Admin can assign the SUPER_ADMIN role", 403);
  }

  // Guard: only a SUPER_ADMIN may remove SUPER_ADMIN from someone who has it
  const currentRoles = await prisma.userRole.findMany({
    where: { userId: id },
    include: { role: { select: { name: true } } },
  });
  const currentlyHasSuperAdmin = currentRoles.some((r) => r.role.name === "SUPER_ADMIN");
  const keepingSuperAdmin = roles.some((r) => r.name === "SUPER_ADMIN");

  if (currentlyHasSuperAdmin && !keepingSuperAdmin && !isSuperAdmin(session.user.roles)) {
    return jsonError("Only a Super Admin can remove the SUPER_ADMIN role", 403);
  }

  // Replace role set atomically
  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: id } }),
    prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId: id, roleId })),
    }),
  ]);

  return jsonOk({ updated: true });
}
