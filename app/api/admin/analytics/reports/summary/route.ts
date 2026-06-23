/**
 * GET /api/admin/analytics/reports/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Returns six KPI metrics. Each metric includes the current total and a
 * percentage trend comparing the current period to the immediately preceding
 * period of equal length.
 */

import { requireAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { jsonError, jsonOk } from "@/lib/api/response";

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function parseRange(url: URL): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const endStr = url.searchParams.get("endDate");
  const startStr = url.searchParams.get("startDate");

  const end = endStr ? new Date(endStr) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startStr
    ? new Date(startStr)
    : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - durationMs);

  return { start, end, prevStart, prevEnd };
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return jsonError("Admin access required", 403);

  const { end, prevEnd } = parseRange(new URL(request.url));

  const [
    totalUsers,
    prevUsers,
    totalBusinesses,
    prevBusinesses,
    pendingVerif,
    prevPendingVerif,
    totalVerif,
    prevTotalVerif,
    flaggedReviews,
    prevFlagged,
    approvedReviews,
    prevApproved,
  ] = await Promise.all([
    // Users — cumulative totals at each snapshot
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { lte: prevEnd } } }),

    // Businesses
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { lte: prevEnd } } }),

    // Pending verifications (real-time, no snapshot needed; compare raw counts)
    prisma.verificationRequest.count({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    }),
    prisma.verificationRequest.count({
      where: {
        status: { in: ["PENDING", "UNDER_REVIEW"] },
        submittedAt: { lte: prevEnd },
      },
    }),

    // Total verifications
    prisma.verificationRequest.count(),
    prisma.verificationRequest.count({ where: { submittedAt: { lte: prevEnd } } }),

    // Flagged reviews
    prisma.review.count({ where: { moderationStatus: "FLAGGED" } }),
    prisma.review.count({
      where: { moderationStatus: "FLAGGED", createdAt: { lte: prevEnd } },
    }),

    // Approved reviews
    prisma.review.count({ where: { moderationStatus: "APPROVED" } }),
    prisma.review.count({
      where: { moderationStatus: "APPROVED", createdAt: { lte: prevEnd } },
    }),
  ]);

  return jsonOk({
    users: {
      value: totalUsers,
      trend: pct(totalUsers, prevUsers),
      positive: totalUsers >= prevUsers,
    },
    businesses: {
      value: totalBusinesses,
      trend: pct(totalBusinesses, prevBusinesses),
      positive: totalBusinesses >= prevBusinesses,
    },
    pendingVerifications: {
      value: pendingVerif,
      trend: pct(pendingVerif, prevPendingVerif),
      positive: pendingVerif >= prevPendingVerif,
    },
    totalVerifications: {
      value: totalVerif,
      trend: pct(totalVerif, prevTotalVerif),
      positive: totalVerif >= prevTotalVerif,
    },
    flaggedReviews: {
      value: flaggedReviews,
      trend: Math.abs(pct(flaggedReviews, prevFlagged)),
      positive: flaggedReviews <= prevFlagged,
    },
    approvedReviews: {
      value: approvedReviews,
      trend: pct(approvedReviews, prevApproved),
      positive: approvedReviews >= prevApproved,
    },
    generatedAt: end.toISOString(),
  });
}
