"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { RegisteredBusiness } from "@/lib/business/registered-business-types";
import { formatBusinessLocation } from "@/lib/business/registered-business-types";
import { BookmarkIcon } from "@/components/layouts/icons";
import { BuildingIcon, PinIcon } from "@/components/landing/icons";
import { Dialog } from "@/components/ui/dialog";
import { InteractiveBusinessRating } from "./interactive-business-rating";

type RegisteredBusinessCardProps = {
  business: RegisteredBusiness;
  currentUserId?: string | null;
  initialRatingCount?: number;
  viewHref?: string;
  reviewHref?: string;
  requireLoginForReview?: boolean;
  canSaveBusiness?: boolean;
  initialIsSaved?: boolean;
};

export function RegisteredBusinessCard({
  business,
  currentUserId,
  initialRatingCount = 0,
  viewHref,
  reviewHref,
  requireLoginForReview = true,
  canSaveBusiness = false,
  initialIsSaved = false,
}: RegisteredBusinessCardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const detailsHref = viewHref ?? `/businesses/${business.slug}?mode=view`;
  const reviewsHref = reviewHref ?? `/businesses/${business.slug}?mode=review#reviews`;
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const disableReview = requireLoginForReview && !isLoggedIn;
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<"review" | "save">("review");
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const encodedReviewHref = encodeURIComponent(reviewsHref);
  const loginHref = `/login?callbackUrl=${encodedReviewHref}`;
  const registerHref = `/register?callbackUrl=${encodedReviewHref}`;

  async function toggleSaved() {
    if (!isLoggedIn) {
      setAuthPromptAction("save");
      setIsAuthPromptOpen(true);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const nextIsSaved = !isSaved;
    const response = await fetch(`/api/businesses/${business.id}/saved`, {
      method: nextIsSaved ? "POST" : "DELETE",
    });

    setIsSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setSaveError(body?.error ?? "Could not update saved business");
      return;
    }

    setIsSaved(nextIsSaved);
    router.refresh();
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link href={detailsHref} className="block size-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.imageUrl ?? "/images/salone.jpg"}
            alt={business.businessName}
            className="size-full object-cover transition hover:scale-[1.02]"
          />
        </Link>
        {canSaveBusiness && (
          <button
            type="button"
            onClick={() => void toggleSaved()}
            disabled={isSaving}
            title={isSaved ? "Remove from saved businesses" : "Save business"}
            aria-label={isSaved ? "Remove from saved businesses" : "Save business"}
            className={`absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-lg border text-sm font-bold shadow-sm transition ${
              isSaved
                ? "border-[#111d63] bg-[#111d63] text-white"
                : "border-white/80 bg-white/95 text-[#111d63] hover:bg-white"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <BookmarkIcon className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={detailsHref}
          className="truncate text-base font-bold text-slate-950 hover:text-[#111d63]"
        >
          {business.businessName}
        </Link>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <PinIcon className="size-3.5 shrink-0" />
          <span className="truncate">{formatBusinessLocation(business)}</span>
        </p>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <BuildingIcon className="size-3.5 shrink-0" />
          <span className="truncate">{business.categoryName}</span>
        </p>

        <InteractiveBusinessRating
          businessId={business.id}
          ownerId={business.ownerId}
          currentUserId={currentUserId}
          initialAverageRating={business.averageRating}
          initialRatingCount={initialRatingCount}
        />

        {saveError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{saveError}</p>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={detailsHref}
            className="inline-flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-[#111d63] px-4 py-3 text-base font-bold text-[#111d63] transition hover:bg-[#111d63]/5"
          >
            View details
          </Link>
          {disableReview ? (
            <button
              type="button"
              onClick={() => {
                setAuthPromptAction("review");
                setIsAuthPromptOpen(true);
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-[#111d63] px-4 py-3 text-base font-bold text-white transition hover:bg-[#27339a]"
            >
              Review
            </button>
          ) : (
            <Link
              href={reviewsHref}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-[#111d63] px-4 py-3 text-base font-bold text-white transition hover:bg-[#27339a]"
            >
              Review
            </Link>
          )}
        </div>
      </div>
      <Dialog
        open={isAuthPromptOpen}
        title={
          authPromptAction === "save"
            ? "Login required to save"
            : "Login required to review"
        }
        className="max-w-md"
      >
        <p className="text-sm text-slate-600">
          {authPromptAction === "save"
            ? "Please log in or create an account before saving this business."
            : "Please log in or create an account before leaving a review."}
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
