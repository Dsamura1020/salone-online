"use client";

import { useState } from "react";
import {
  getNextScoreOnStarClick,
  getStarFillRatio,
  formatRatingScore,
  MAX_RATING_SCORE,
} from "@/lib/ratings/half-star";

type HalfStarRatingInputProps = {
  value: number;
  onChange: (score: number) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  showScoreLabel?: boolean;
};

export function HalfStarRatingInput({
  value,
  onChange,
  disabled = false,
  loading = false,
  size = "md",
  showScoreLabel = true,
}: HalfStarRatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState(-1);
  const starSize = size === "sm" ? "text-lg" : "text-xl";
  const displayRating = hoveredStar >= 0 ? hoveredStar + 1 : value;

  function handleStarClick(starIndex: number) {
    if (disabled || loading) {
      return;
    }

    onChange(getNextScoreOnStarClick(starIndex, value));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="inline-flex items-center gap-0.5"
        onMouseLeave={() => setHoveredStar(-1)}
        role={disabled ? undefined : "group"}
        aria-label="Rate in half-star steps"
      >
        {Array.from({ length: 5 }).map((_, starIndex) => {
          const fillRatio = getStarFillRatio(starIndex, displayRating);

          return (
            <button
              key={starIndex}
              type="button"
              disabled={disabled || loading}
              onMouseEnter={() => !disabled && setHoveredStar(starIndex)}
              onClick={() => handleStarClick(starIndex)}
              className={[
                "relative leading-none transition",
                starSize,
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-110",
                loading ? "opacity-60" : "",
              ].join(" ")}
              aria-label={`Rate star ${starIndex + 1}, half then full`}
            >
              <span className="text-slate-300" aria-hidden="true">
                ★
              </span>
              <span
                className="absolute inset-0 overflow-hidden text-amber-400"
                style={{ width: `${fillRatio * 100}%` }}
                aria-hidden="true"
              >
                ★
              </span>
            </button>
          );
        })}
      </div>
      {showScoreLabel && value > 0 && (
        <span className="text-sm font-medium text-slate-600">
          {formatRatingScore(value)}/{MAX_RATING_SCORE}
        </span>
      )}
    </div>
  );
}
