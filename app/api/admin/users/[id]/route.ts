/**
 * GET  /api/admin/users/[id]  — fetch single user
 * PATCH /api/admin/users/[id] — update editable fields
 * DELETE /api/admin/users/[id] — delete user (with guards)
 */

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";
import { isSuperAdmin } from "@/lib/auth/permissions";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  username: true,
  isActive: true,
  isSuspended: true,
  createdAt: true,
  roles: {
    include: {
      role: { select: { id: true, name: true } },
    },
  },
} as const;

const patchSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  email: z.string().email("Enter a valid email address").optional(),
  isActive: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) return jsonError("User not found", 404);

  return jsonOk({ user });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  // Guard: email uniqueness check
  if (data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
      select: { id: true },
    });
    if (conflict) return jsonError("Email already in use by another account", 409);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  return jsonOk({ user });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const { id } = await params;

  // Cannot delete yourself
  if (id === session.user.id) {
    return jsonError("Cannot delete your own account", 400);
  }

  // Check if target is SUPER_ADMIN — only a SUPER_ADMIN may delete one
  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      roles: { include: { role: { select: { name: true } } } },
    },
  });

  if (!target) return jsonError("User not found", 404);

  const targetIsSuperAdmin = target.roles.some((r) => r.role.name === "SUPER_ADMIN");
  if (targetIsSuperAdmin && !isSuperAdmin(session.user.roles)) {
    return jsonError("Insufficient permissions to delete a Super Admin", 403);
  }

  await prisma.user.delete({ where: { id } });

  return jsonOk({ deleted: true });
}
