/**
 * GET /api/admin/analytics/reports/categories
 *
 * Returns all business categories with counts, percentages, and colours.
 * The date-range params are accepted (for consistency) but categories use
 * cumulative totals; filtering by registration date is opt-in via ?dateFilter=1.
 */

import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#94a3b8", // slate (Other)
];

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const url = new URL(request.url);
  const endStr = url.searchParams.get("endDate");
  const startStr = url.searchParams.get("startDate");
  const applyDateFilter = url.searchParams.get("dateFilter") === "1";

  const where = applyDateFilter
    ? {
        createdAt: {
          ...(startStr && { gte: new Date(startStr) }),
          ...(endStr && { lte: new Date(new Date(endStr).setHours(23, 59, 59, 999)) }),
        },
      }
    : {};

  const groups = await prisma.business.groupBy({
    by: ["categoryId"],
    _count: { categoryId: true },
    where,
    orderBy: { _count: { categoryId: "desc" } },
  });

  const total = groups.reduce((s, g) => s + g._count.categoryId, 0);
  if (total === 0) {
    return jsonOk({ categories: [], total: 0 });
  }

  const topGroups = groups.slice(0, 6);
  const otherCount = groups.slice(6).reduce((s, g) => s + g._count.categoryId, 0);

  const catIds = topGroups.map((g) => g.categoryId);
  const catRecords =
    catIds.length > 0
      ? await prisma.businessCategory.findMany({
          where: { id: { in: catIds } },
          select: { id: true, name: true },
        })
      : [];

  const catById = new Map(catRecords.map((c) => [c.id, c.name]));

  const categories = topGroups.map((g, i) => ({
    name: catById.get(g.categoryId) ?? "Uncategorized",
    count: g._count.categoryId,
    percentage: Math.round((g._count.categoryId / total) * 100),
    color: COLORS[i] ?? COLORS[0],
  }));

  if (otherCount > 0) {
    categories.push({
      name: "Other",
      count: otherCount,
      percentage: Math.round((otherCount / total) * 100),
      color: COLORS[6],
    });
  }

  return jsonOk({ categories, total });
}
