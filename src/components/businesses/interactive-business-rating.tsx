"use client";

import { useEffect, useState } from "react";
import { HalfStarRatingInput } from "@/components/ratings/half-star-rating-input";
import {
  formatRatingScore,
  isValidRatingScore,
  MAX_RATING_SCORE,
} from "@/lib/ratings/half-star";

type InteractiveBusinessRatingProps = {
  businessId: string;
  ownerId: string;
  currentUserId?: string | null;
  initialAverageRating: number;
  initialRatingCount: number;
  compact?: boolean;
};

export function InteractiveBusinessRating({
  businessId,
  ownerId,
  currentUserId,
  initialAverageRating,
  initialRatingCount,
  compact = false,
}: InteractiveBusinessRatingProps) {
  const isOwner = Boolean(currentUserId && currentUserId === ownerId);
  const isLoggedIn = Boolean(currentUserId);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [yourRating, setYourRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner || !currentUserId) {
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

        const score = body.data?.yourRating;
        if (score != null && isValidRatingScore(score)) {
          setYourRating(score);
        }
      })
      .catch(() => undefined);
  }, [businessId, currentUserId, isOwner]);

  async function submitRating(score: number) {
    if (!currentUserId) {
      setError("Please log in to rate this business");
      return;
    }

    if (isOwner || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/businesses/${businessId}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });

    setLoading(false);

    const body = (await response.json()) as {
      success?: boolean;
      error?: string;
      data?: {
        averageRating: number;
        ratingCount: number;
        yourRating: number;
      };
    };

    if (!response.ok) {
      setError(body.error ?? "Could not save rating");
      return;
    }

    if (body.data) {
      setAverageRating(body.data.averageRating);
      setRatingCount(body.data.ratingCount);
      setYourRating(body.data.yourRating);
    }
  }

  const displayAverage = averageRating > 0 ? averageRating.toFixed(1) : "New";

  return (
    <div className={compact ? "mt-1.5" : "mt-3"}>
      <div className="flex flex-wrap items-center gap-1.5">
        <HalfStarRatingInput
          value={yourRating ?? 0}
          onChange={(score) => void submitRating(score)}
          disabled={isOwner || !isLoggedIn}
          loading={loading}
          showScoreLabel={false}
          size={compact ? "sm" : "md"}
        />
        <span
          className={
            compact
              ? "text-xs font-bold text-slate-800"
              : "text-sm font-bold text-slate-800"
          }
        >
          {displayAverage}
          {ratingCount > 0 && (
            <span className="font-medium text-slate-500"> ({ratingCount})</span>
          )}
        </span>
      </div>
      {isOwner && !compact && (
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          You cannot rate your own business
        </p>
      )}
      {!isOwner && !isLoggedIn && !compact && (
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          Please log in to rate this business
        </p>
      )}
      {yourRating != null && !isOwner && !compact && (
        <p className="mt-1 text-[11px] font-medium text-emerald-700">
          You rated {formatRatingScore(yourRating)} / {MAX_RATING_SCORE}
        </p>
      )}
      {!isOwner && isLoggedIn && yourRating == null && !compact && (
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          Tap a star twice for half, then full
        </p>
      )}
      {error && (
        <p
          className={
            compact
              ? "mt-0.5 text-[10px] font-medium text-red-600"
              : "mt-1 text-[11px] font-medium text-red-600"
          }
        >
          {error}
        </p>
      )}
    </div>
  );
}
