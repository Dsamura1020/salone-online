"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import type { SearchResult } from "../business-search";
import { StarRating } from "@/components/landing/star-rating";
import { Dialog } from "@/components/ui/dialog";

type BusinessSearchResultCardProps = {
  result: SearchResult;
  variant?: "hero" | "default";
  descriptionMaxLength?: number;
};

function formatRating(rating: number) {
  return rating > 0 ? rating.toFixed(1) : "No ratings yet";
}

function truncateDescription(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function BusinessSearchResultCard({
  result,
  variant = "default",
  descriptionMaxLength = 160,
}: BusinessSearchResultCardProps) {
  const { data: session } = useSession();
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const isHero = variant === "hero";
  const detailsHref = `${result.url}?mode=view`;
  const reviewsHref = `${result.url}?mode=review#reviews`;
  const isLoggedIn = Boolean(session?.user?.id);
  const encodedReviewHref = encodeURIComponent(reviewsHref);
  const loginHref = `/login?callbackUrl=${encodedReviewHref}`;
  const registerHref = `/register?callbackUrl=${encodedReviewHref}`;

  return (
    <article
      className={
        isHero
          ? "rounded-xl border border-white/15 bg-white/95 p-3 shadow-md backdrop-blur"
          : "rounded-xl border border-zinc-200 bg-white p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-1.5">
        <h2
          className={
            isHero
              ? "text-sm font-bold text-[#111d63]"
              : "font-semibold text-[#111d63]"
          }
        >
          <Link href={result.url} className="hover:underline">
            {result.businessName}
          </Link>
        </h2>
      </div>
      <p className="mt-1 text-xs font-medium text-zinc-500">
        {result.categoryName} · {result.city}
      </p>
      <Link
        href={reviewsHref}
        className={
          isHero
            ? "mt-2 inline-flex w-fit items-center gap-1.5 rounded-md transition hover:bg-amber-50/80"
            : "mt-2 inline-flex w-fit items-center gap-1.5 rounded-md transition hover:bg-amber-50"
        }
      >
        <StarRating rating={result.averageRating} size="sm" />
        <span className="text-xs font-bold text-amber-800">
          {formatRating(result.averageRating)}
          {result.reviewCount > 0 && (
            <span className="font-medium text-zinc-500">
              {" "}
              ({result.reviewCount})
            </span>
          )}
        </span>
      </Link>
      {result.description && (
        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {truncateDescription(result.description, descriptionMaxLength)}
        </p>
      )}
      <Link
        href={detailsHref}
        className={
          isHero
            ? "mt-2 inline-flex rounded-md border border-[#111d63] px-3 py-1.5 text-xs font-bold text-[#111d63] transition hover:bg-[#111d63]/5"
            : "mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        }
      >
        View details
      </Link>
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={() => setIsAuthPromptOpen(true)}
          className={
            isHero
              ? "ml-2 mt-2 inline-flex rounded-md bg-[#111d63] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#27339a]"
              : "ml-2 mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          }
        >
          Review
        </button>
      ) : (
        <Link
          href={reviewsHref}
          className={
            isHero
              ? "ml-2 mt-2 inline-flex rounded-md bg-[#111d63] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#27339a]"
              : "ml-2 mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          }
        >
          Review
        </Link>
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
    </article>
  );
}
