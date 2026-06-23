"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { RegisteredBusinessCard } from "@/components/businesses/registered-business-card";
import type { RegisteredBusiness } from "@/lib/business/registered-business-types";

type RagCitation = {
  id: string;
  businessName: string;
  url: string;
  categoryName: string;
  location: string;
  rating: number;
  reviewCount: number;
};

type RagResponse = {
  question: string;
  answer: string;
  citations: RagCitation[];
  totalMatches: number;
};

type HeroSearchResultsPopupProps = {
  open: boolean;
  query: string;
  loading: boolean;
  searchPending: boolean;
  ragLoading: boolean;
  ragError: string | null;
  ragAnswer: RagResponse | null;
  error: string | null;
  hasSearched: boolean;
  businesses: RegisteredBusiness[];
  onClose: () => void;
};

function citationToBusiness(source: RagCitation): RegisteredBusiness {
  const locationParts = source.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = locationParts[0] ?? "Unknown";
  const country =
    locationParts.length >= 2 ? locationParts[locationParts.length - 1] : city;
  const stateProvince =
    locationParts.length >= 3 ? locationParts.slice(1, -1).join(", ") : null;
  const slugParts = source.url.split("/").filter(Boolean);
  const slug = slugParts[slugParts.length - 1] ?? source.id;

  return {
    id: source.id,
    ownerId: "",
    businessName: source.businessName,
    slug,
    description: null,
    averageRating: source.rating,
    reviewCount: source.reviewCount,
    ratingCount: source.reviewCount,
    isVerified: true,
    categoryName: source.categoryName,
    city,
    stateProvince,
    country,
    imageUrl: null,
  };
}

export function HeroSearchResultsPopup({
  open,
  query,
  loading,
  searchPending,
  ragLoading,
  ragError,
  ragAnswer,
  error,
  hasSearched,
  businesses,
  onClose,
}: HeroSearchResultsPopupProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !hasSearched) {
    return null;
  }

  const trimmedQuery = query.trim();
  const aiCitations = ragAnswer?.citations ?? [];
  const showSearchingState = searchPending || loading;
  const hasTopRatedResults = businesses.length > 0;
  const shouldOverrideNoMatchMessage =
    hasTopRatedResults &&
    Boolean(ragAnswer) &&
    aiCitations.length === 0 &&
    !ragLoading &&
    !ragError;
  const aiDisplayAnswer = shouldOverrideNoMatchMessage
    ? `I found ${businesses.length} related business${businesses.length === 1 ? "" : "es"} below for "${trimmedQuery}". You can open them directly or try a shorter prompt for a more specific AI summary.`
    : ragAnswer?.answer ?? null;
  const aiBusinesses = aiCitations.map(citationToBusiness);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-search-results-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Close search results"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#111d63]">
              Top rated (2.0–5.0)
            </p>
            <h2
              id="hero-search-results-title"
              className="mt-1 text-lg font-black text-slate-950 sm:text-xl"
            >
              {showSearchingState
                ? "Searching…"
                : businesses.length > 0
                  ? `${businesses.length} result${businesses.length === 1 ? "" : "s"} for “${trimmedQuery}”`
                  : `No results for “${trimmedQuery}”`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              AI answer
            </p>
            {ragLoading ? (
              <p className="mt-2 text-sm font-medium text-slate-500">Thinking...</p>
            ) : ragError ? (
              <p className="mt-2 text-sm font-semibold text-red-600">{ragError}</p>
            ) : aiDisplayAnswer ? (
              <p className="mt-2 text-sm leading-6 text-slate-700">{aiDisplayAnswer}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Ask a question to get an AI-grounded summary of matching businesses.
              </p>
            )}
          </div>

          {error && !loading && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {showSearchingState && (
            <p className="py-8 text-center text-sm font-medium text-slate-500">
              Finding top-rated businesses…
            </p>
          )}

          {!showSearchingState && businesses.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <RegisteredBusinessCard
                  key={business.id}
                  business={business}
                  initialRatingCount={business.ratingCount}
                />
              ))}
            </div>
          )}

          {!loading && businesses.length === 0 && aiBusinesses.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiBusinesses.map((business) => (
                <RegisteredBusinessCard
                  key={`ai-${business.id}`}
                  business={business}
                  initialRatingCount={business.ratingCount}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body,
  );
}
