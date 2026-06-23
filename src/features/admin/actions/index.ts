"use server";

import { requireAdmin } from "@/lib/auth/auth";
import { moderateReview } from "@/services/review.service";

export async function exportReportAction(exportType: "businesses" | "users" | "reviews") {
  const session = await requireAdmin();
  if (!session) {
    throw new Error("Admin access required");
  }

  return { url: `/api/admin/export?type=${exportType}&format=csv` };
}

export async function moderateReviewAction(params: {
  reviewId: string;
  moderationStatus: "APPROVED" | "REJECTED" | "FLAGGED";
  isHidden?: boolean;
}) {
  const session = await requireAdmin();
  if (!session) {
    throw new Error("Admin access required");
  }

  return moderateReview(params);
}
