import type { ReportStatus } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth";
import { resolveReport } from "@/services/review.service";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

const resolveReportSchema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"]),
});

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Admin access required", 403);
  }

  const { reportId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = resolveReportSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  try {
    const report = await resolveReport({
      reportId,
      status: parsed.data.status as ReportStatus,
    });
    return jsonOk({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update report";
    return jsonError(message, 400);
  }
}
