"use client";

import { useState } from "react";

type ReviewForModeration = {
  id: string;
  title: string;
  content: string;
  moderationStatus: string;
  isHidden: boolean;
  createdAt: Date;
  user: { email: string; firstName: string | null; lastName: string | null } | null;
  business: { businessName: string; slug: string };
  reports: { id: string; reason: string; status: string }[];
};

type ReviewReport = {
  id: string;
  reason: string;
  status: string;
  createdAt: Date;
  review: {
    id: string;
    title: string;
    business: { businessName: string };
  };
  reportedBy: { email: string };
};

type AdminReviewModerationProps = {
  initialReviews: ReviewForModeration[];
  initialReports: ReviewReport[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  FLAGGED: "bg-orange-100 text-orange-800",
};

const REPORT_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  DISMISSED: "bg-slate-100 text-slate-600",
};

type ReviewTab = "ALL" | "PENDING" | "FLAGGED" | "APPROVED" | "REJECTED";

export function AdminReviewModeration({
  initialReviews,
  initialReports,
}: AdminReviewModerationProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [reports, setReports] = useState(initialReports);
  const [mainTab, setMainTab] = useState<"reviews" | "reports">("reviews");
  const [reviewFilter, setReviewFilter] = useState<ReviewTab>("ALL");
  const [reportFilter, setReportFilter] = useState<"ALL" | "OPEN" | "REVIEWED" | "DISMISSED">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredReviews =
    reviewFilter === "ALL"
      ? reviews
      : reviews.filter((r) => r.moderationStatus === reviewFilter);

  const filteredReports =
    reportFilter === "ALL"
      ? reports
      : reports.filter((r) => r.status === reportFilter);

  async function moderateReview(
    reviewId: string,
    moderationStatus: "APPROVED" | "REJECTED" | "FLAGGED",
    isHidden?: boolean,
  ) {
    setLoadingId(reviewId);
    const body: Record<string, unknown> = { moderationStatus };
    if (isHidden !== undefined) {
      body.isHidden = isHidden;
    }

    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoadingId(null);

    if (response.ok) {
      setReviews((current) =>
        current.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                moderationStatus,
                isHidden: isHidden !== undefined ? isHidden : r.isHidden,
              }
            : r,
        ),
      );
    }
  }

  async function toggleHidden(review: ReviewForModeration) {
    await moderateReview(
      review.id,
      review.moderationStatus as "APPROVED" | "REJECTED" | "FLAGGED",
      !review.isHidden,
    );
  }

  async function resolveReport(reportId: string, status: "REVIEWED" | "DISMISSED") {
    setLoadingId(reportId);
    const response = await fetch(`/api/admin/review-reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    if (response.ok) {
      setReports((current) =>
        current.map((r) => (r.id === reportId ? { ...r, status } : r)),
      );
    }
  }

  const reviewTabCounts: Record<ReviewTab, number> = {
    ALL: reviews.length,
    PENDING: reviews.filter((r) => r.moderationStatus === "PENDING").length,
    FLAGGED: reviews.filter((r) => r.moderationStatus === "FLAGGED").length,
    APPROVED: reviews.filter((r) => r.moderationStatus === "APPROVED").length,
    REJECTED: reviews.filter((r) => r.moderationStatus === "REJECTED").length,
  };

  const openReportCount = reports.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Main tab strip */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMainTab("reviews")}
          className={`px-4 py-2.5 text-sm font-bold transition ${
            mainTab === "reviews"
              ? "border-b-2 border-[#10206f] text-[#10206f]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Reviews
        </button>
        <button
          type="button"
          onClick={() => setMainTab("reports")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition ${
            mainTab === "reports"
              ? "border-b-2 border-[#10206f] text-[#10206f]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Review Reports
          {openReportCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
              {openReportCount}
            </span>
          )}
        </button>
      </div>

      {mainTab === "reviews" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 border-b border-slate-100 px-4 pt-4">
            {(["ALL", "PENDING", "FLAGGED", "APPROVED", "REJECTED"] as ReviewTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReviewFilter(tab)}
                  className={`mb-3 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    reviewFilter === tab
                      ? "bg-[#10206f] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab} ({reviewTabCounts[tab]})
                </button>
              ),
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">
              No reviews in this category.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReviews.map((review) => {
                const authorName = review.user
                  ? `${review.user.firstName ?? ""} ${review.user.lastName ?? ""}`.trim() ||
                    review.user.email
                  : "Guest";

                return (
                  <div key={review.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950">{review.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {review.business.businessName} · {authorName} ·{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {review.content}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_COLORS[review.moderationStatus] ?? "bg-slate-100 text-slate-700"}`}
                          >
                            {review.moderationStatus}
                          </span>
                          {review.isHidden && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                              HIDDEN
                            </span>
                          )}
                          {review.reports.length > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                              {review.reports.length} report{review.reports.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {review.moderationStatus !== "APPROVED" && (
                            <ActionButton
                              onClick={() => void moderateReview(review.id, "APPROVED")}
                              loading={loadingId === review.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Approve
                            </ActionButton>
                          )}
                          {review.moderationStatus !== "REJECTED" && (
                            <ActionButton
                              onClick={() => void moderateReview(review.id, "REJECTED")}
                              loading={loadingId === review.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </ActionButton>
                          )}
                          {review.moderationStatus !== "FLAGGED" && (
                            <ActionButton
                              onClick={() => void moderateReview(review.id, "FLAGGED")}
                              loading={loadingId === review.id}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Flag
                            </ActionButton>
                          )}
                          <ActionButton
                            onClick={() => void toggleHidden(review)}
                            loading={loadingId === review.id}
                            className="bg-slate-600 hover:bg-slate-700"
                          >
                            {review.isHidden ? "Unhide" : "Hide"}
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mainTab === "reports" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-slate-100 px-4 pt-4">
            {(["ALL", "OPEN", "REVIEWED", "DISMISSED"] as const).map((tab) => {
              const count =
                tab === "ALL"
                  ? reports.length
                  : reports.filter((r) => r.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReportFilter(tab)}
                  className={`mb-3 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    reportFilter === tab
                      ? "bg-[#10206f] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {filteredReports.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">
              No reports in this category.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <div key={report.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">
                        {report.review.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {report.review.business.businessName} · Reported by{" "}
                        {report.reportedBy.email} ·{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {report.reason}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${REPORT_STATUS_COLORS[report.status] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {report.status}
                      </span>
                      {report.status === "OPEN" && (
                        <div className="flex gap-1.5">
                          <ActionButton
                            onClick={() => void resolveReport(report.id, "REVIEWED")}
                            loading={loadingId === report.id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Reviewed
                          </ActionButton>
                          <ActionButton
                            onClick={() => void resolveReport(report.id, "DISMISSED")}
                            loading={loadingId === report.id}
                            className="bg-slate-500 hover:bg-slate-600"
                          >
                            Dismiss
                          </ActionButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  loading,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white transition disabled:opacity-60 ${className}`}
    >
      {loading ? "…" : children}
    </button>
  );
}
