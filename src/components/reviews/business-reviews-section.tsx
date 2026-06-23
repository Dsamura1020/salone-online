"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HalfStarRatingInput } from "@/components/ratings/half-star-rating-input";
import { StarRating } from "@/components/landing/star-rating";
import { Dialog } from "@/components/ui/dialog";
import { isValidRatingScore } from "@/lib/ratings/half-star";

type PublicReview = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorId: string | null;
  score: number | null;
};

type BusinessReviewsSectionProps = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  ownerId: string;
  currentUserId?: string | null;
  averageRating: number;
  reviewCount: number;
  initialReviews: PublicReview[];
  isLoggedIn: boolean;
  showReviewForm?: boolean;
  embedded?: boolean;
};

export function BusinessReviewsSection({
  businessId,
  businessSlug,
  businessName,
  ownerId,
  currentUserId,
  isLoggedIn,
  averageRating,
  reviewCount,
  initialReviews,
  embedded = false,
  showReviewForm = true,
}: BusinessReviewsSectionProps) {
  const isOwner = Boolean(currentUserId && currentUserId === ownerId);
  const [reviews, setReviews] = useState(initialReviews);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  // Edit state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Report state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const reviewHref = `/businesses/${businessSlug}?mode=review#reviews`;
  const encodedReviewHref = encodeURIComponent(reviewHref);
  const loginHref = `/login?callbackUrl=${encodedReviewHref}`;
  const registerHref = `/register?callbackUrl=${encodedReviewHref}`;

  useEffect(() => {
    if (isOwner) {
      return;
    }

    if (!isLoggedIn) {
      return;
    }

    void fetch(`/api/businesses/${businessId}/ratings`)
      .then(async (response) => {
        const body = (await response.json()) as {
          data?: { yourRating: number | null };
        };
        if (!response.ok) {
          return;
        }

        const existing = body.data?.yourRating;
        if (existing != null && isValidRatingScore(existing)) {
          setScore(existing);
        }
      })
      .catch(() => undefined);
  }, [businessId, currentUserId, isLoggedIn, isOwner]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setError("Please log in to submit a review");
      return;
    }

    if (isOwner) {
      return;
    }

    if (!isValidRatingScore(score)) {
      setError("Please select a rating (tap stars for half or full points)");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/businesses/${businessId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        score,
      }),
    });

    setLoading(false);

    const body = (await response.json()) as {
      success?: boolean;
      error?: string;
      data?: { message?: string };
    };

    if (!response.ok) {
      setError(body.error ?? "Could not submit review");
      return;
    }

    setSuccess(
      "Review submitted! It will appear after moderation.",
    );
    setTitle("");
    setContent("");
    setScore(0);
  }

  async function onEditSave(reviewId: string) {
    setEditLoading(true);
    setEditError(null);

    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });

    setEditLoading(false);

    const body = (await response.json()) as {
      success?: boolean;
      error?: string;
    };

    if (!response.ok) {
      setEditError(body.error ?? "Could not update review");
      return;
    }

    setReviews((current) =>
      current.map((r) =>
        r.id === reviewId ? { ...r, title: editTitle, content: editContent } : r,
      ),
    );
    setEditingReviewId(null);
    setEditTitle("");
    setEditContent("");
    setSuccess("Review updated.");
  }

  async function onDeleteConfirm(reviewId: string) {
    setDeleteLoading(true);

    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });

    setDeleteLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Could not delete review");
      setDeletingReviewId(null);
      return;
    }

    setReviews((current) => current.filter((r) => r.id !== reviewId));
    setDeletingReviewId(null);
    setSuccess("Review deleted.");
  }

  async function onReportSubmit(reviewId: string) {
    if (!reportReason.trim()) {
      setReportError("Please describe the issue.");
      return;
    }

    setReportLoading(true);
    setReportError(null);
    setReportSuccess(null);

    const response = await fetch(`/api/reviews/${reviewId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });

    setReportLoading(false);

    const body = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok) {
      setReportError(body.error ?? "Could not submit report");
      return;
    }

    setReportSuccess("Thank you — your report has been submitted.");
    setReportReason("");
  }

  return (
    <section
      id={embedded ? undefined : "reviews"}
      className={
        embedded
          ? "space-y-6"
          : "mt-10 scroll-mt-24 border-t border-slate-200 pt-8"
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Ratings & Reviews</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share your experience with {businessName}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <StarRating rating={averageRating} size="sm" />
          <span className="text-sm font-bold text-slate-800">
            {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            {reviewCount > 0 && (
              <span className="font-medium text-slate-500"> ({reviewCount})</span>
            )}
          </span>
        </div>
      </div>

      {showReviewForm && (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <h3 className="text-base font-bold text-slate-900">Write a review</h3>
          {!isOwner && (
            <p className="mt-2 text-sm text-slate-600">
              Please log in to rate and review. Business owners cannot review their own
              listing.
            </p>
          )}
          {isOwner && (
            <p className="mt-2 text-sm text-slate-600">
              You cannot rate or review your own business.
            </p>
          )}

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Your rating
            <div className="mt-2 ">
                  <HalfStarRatingInput
                    value={score}
                    onChange={setScore}
                    disabled={!isLoggedIn || isOwner || loading}
                    loading={loading}
                    />
                      <p className="mt-1 text-xs text-slate-500"
                  >
                    Tap each star twice: first for half, second for full
                  </p>
            </div>
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!isLoggedIn || isOwner || loading}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              placeholder="Summarize your experience"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Review
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!isLoggedIn || isOwner || loading}
              required
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              placeholder="Tell others about this business"
            />
          </label>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          )}
          {success && (
            <p className="mt-3 text-sm font-medium text-emerald-700">{success}</p>
          )}

          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => setIsAuthPromptOpen(true)}
              className="mt-4 inline-flex rounded-lg bg-[#111d63] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#27339a]"
            >
              Submit review
            </button>
          ) : (
            <button
              type="submit"
              disabled={isOwner || loading}
              className="mt-4 inline-flex rounded-lg bg-[#111d63] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#27339a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit review"}
            </button>
          )}
        </form>
      )}

      <Dialog
        open={isAuthPromptOpen}
        title="Login required to review"
        className="max-w-md"
      >
        <p className="text-sm text-slate-600">
          Please log in or create an account before leaving a review.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsAuthPromptOpen(false)}
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <Link
            href={registerHref}
            className="inline-flex rounded-lg border border-[#111d63] bg-white px-4 py-2 text-sm font-bold text-[#111d63] transition hover:bg-[#111d63]/5"
          >
            Register
          </Link>
          <Link
            href={loginHref}
            className="inline-flex rounded-lg bg-[#111d63] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#27339a]"
          >
            Login
          </Link>
        </div>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deletingReviewId)}
        title="Delete review"
        className="max-w-sm"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this review? This cannot be undone.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={deleteLoading}
            onClick={() => setDeletingReviewId(null)}
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteLoading}
            onClick={() => {
              if (deletingReviewId) {
                void onDeleteConfirm(deletingReviewId);
              }
            }}
            className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleteLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Dialog>

      {/* Report dialog */}
      <Dialog
        open={Boolean(reportingReviewId)}
        title="Report review"
        className="max-w-md"
      >
        <p className="text-sm text-slate-600">
          Describe why you are reporting this review. Our team will review your
          report within 24 hours.
        </p>
        <textarea
          value={reportReason}
          onChange={(event) => setReportReason(event.target.value)}
          rows={4}
          placeholder="Describe the issue with this review…"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {reportError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{reportError}</p>
        )}
        {reportSuccess && (
          <p className="mt-2 text-xs font-semibold text-emerald-700">{reportSuccess}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setReportingReviewId(null);
              setReportReason("");
              setReportError(null);
              setReportSuccess(null);
            }}
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
          {!reportSuccess && (
            <button
              type="button"
              disabled={reportLoading}
              onClick={() => {
                if (reportingReviewId) {
                  void onReportSubmit(reportingReviewId);
                }
              }}
              className="inline-flex rounded-lg bg-[#111d63] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#27339a] disabled:opacity-60"
            >
              {reportLoading ? "Submitting…" : "Submit report"}
            </button>
          )}
        </div>
      </Dialog>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No published reviews yet. Be the first to review this business.
          </p>
        ) : (
          reviews.map((review) => {
            const isAuthor = Boolean(currentUserId && review.authorId === currentUserId);
            const canReport =
              isLoggedIn && !isAuthor && !isOwner;

            if (editingReviewId === review.id) {
              return (
                <article
                  key={review.id}
                  className="rounded-xl border border-[#111d63]/30 bg-white p-4"
                >
                  <label className="block text-sm font-semibold text-slate-700">
                    Title
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    Review
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={4}
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  {editError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">{editError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={editLoading}
                      onClick={() => void onEditSave(review.id)}
                      className="rounded-lg bg-[#111d63] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#27339a] disabled:opacity-60"
                    >
                      {editLoading ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      disabled={editLoading}
                      onClick={() => {
                        setEditingReviewId(null);
                        setEditError(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={review.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-950">{review.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-500">{review.authorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.score != null && review.score > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={review.score} size="sm" />
                      </div>
                    )}
                    {isAuthor && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(review.id);
                            setEditTitle(review.title);
                            setEditContent(review.content);
                            setEditError(null);
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#111d63]"
                          aria-label="Edit review"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingReviewId(review.id)}
                          className="rounded-md border border-red-100 bg-white px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          aria-label="Delete review"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {canReport && (
                      <button
                        type="button"
                        onClick={() => {
                          setReportingReviewId(review.id);
                          setReportReason("");
                          setReportError(null);
                          setReportSuccess(null);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-red-500"
                        aria-label="Report review"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.content}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
