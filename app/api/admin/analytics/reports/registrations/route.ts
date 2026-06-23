/**
 * GET /api/admin/analytics/reports/registrations?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Returns the number of new business registrations for each calendar day
 * within the requested date range (inclusive).
 */

import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortLabel(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const url = new URL(request.url);
  const endStr = url.searchParams.get("endDate");
  const startStr = url.searchParams.get("startDate");

  const end = endStr ? new Date(endStr) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startStr
    ? new Date(startStr)
    : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  // Fetch all businesses created in the range (createdAt only)
  const businesses = await prisma.business.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true },
  });

  // Build a map: dateString → count
  const countByDay = new Map<string, number>();
  for (const b of businesses) {
    const key = isoDate(b.createdAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // Build ordered array covering every day in the range
  const registrations: { date: string; label: string; count: number }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = isoDate(cursor);
    registrations.push({
      date: dateStr,
      label: shortLabel(cursor),
      count: countByDay.get(dateStr) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return jsonOk({ registrations });
}
