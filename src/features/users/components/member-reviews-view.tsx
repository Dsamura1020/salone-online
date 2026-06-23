"use client";

import { useState } from "react";
import Link from "next/link";
import type { MemberDashboardData } from "@/features/users/services/member-dashboard-data";
import { EmptyState, Panel } from "@/components/layouts/dashboard-cards";

export function MemberReviewsView({
  reviews: initialReviews,
}: {
  reviews: MemberDashboardData["reviews"];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (reviews.length === 0) {
    return (
      <EmptyState title="No reviews yet">
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Share feedback on businesses you have used to help others discover
          trusted services.
        </p>
        <Link
          href="/businesses"
          className="mt-4 inline-flex rounded-lg bg-[#10206f] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          Find a business to review
        </Link>
      </EmptyState>
    );
  }

  async function handleEditSave(reviewId: string) {
    setEditLoading(true);
    setEditError(null);
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    setEditLoading(false);
    const body = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok) {
      setEditError(body.error ?? "Could not update review");
      return;
    }
    setReviews((current) =>
      current.map((r) =>
        r.id === reviewId ? { ...r, title: editTitle, content: editContent } : r,
      ),
    );
    setEditingId(null);
  }

  async function handleDeleteConfirm(reviewId: string) {
    setDeleteLoading(true);
    const response = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    setDeleteLoading(false);
    if (response.ok) {
      setReviews((current) => current.filter((r) => r.id !== reviewId));
    }
    setDeletingId(null);
  }

  return (
    <Panel title="Reviews" subtitle="Reviews you have submitted">
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Delete review</h2>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this review? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => void handleDeleteConfirm(deletingId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => {
          if (editingId === review.id) {
            return (
              <article
                key={review.id}
                className="rounded-xl border border-[#10206f]/30 bg-white p-4"
              >
                <label className="block text-xs font-extrabold text-slate-950">
                  Title
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                  />
                </label>
                <label className="mt-3 block text-xs font-extrabold text-slate-950">
                  Review
                  <textarea
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    rows={4}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                  />
                </label>
                {editError && (
                  <p className="mt-2 text-xs font-semibold text-red-600">{editError}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={editLoading}
                    onClick={() => void handleEditSave(review.id)}
                    className="rounded-lg bg-[#10206f] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                  >
                    {editLoading ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    disabled={editLoading}
                    onClick={() => {
                      setEditingId(null);
                      setEditError(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700"
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    {review.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    <Link
                      href={`/businesses/${review.businessSlug}`}
                      className="text-[#10206f] hover:underline"
                    >
                      {review.businessName}
                    </Link>
                    {" · "}
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold capitalize text-slate-700">
                    {review.moderationStatus.toLowerCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(review.id);
                      setEditTitle(review.title);
                      setEditContent(review.content);
                      setEditError(null);
                    }}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#10206f]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(review.id)}
                    className="rounded-md border border-red-100 bg-white px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {review.score != null && (
                <p className="mt-2 text-xs font-bold text-amber-600">
                  Your rating: {review.score}/5
                </p>
              )}
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                {review.content}
              </p>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
