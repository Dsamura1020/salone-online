import type { ReportStatus } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth";
import { listAllReports } from "@/services/review.service";

const VALID_STATUSES = new Set<string>(["OPEN", "REVIEWED", "DISMISSED"]);

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Admin access required", 403);
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as ReportStatus)
      : undefined;

  const reports = await listAllReports(status);
  return jsonOk({ reports });
}
