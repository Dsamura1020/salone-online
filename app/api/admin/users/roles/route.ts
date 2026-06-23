/**
 * GET /api/admin/users/roles — list all available roles
 */

import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  return jsonOk({ roles });
}
