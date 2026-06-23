"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardBusinessCard } from "@/components/businesses/dashboard-business-card";
import type { RegisteredBusiness } from "@/lib/business/registered-business-types";

export const DASHBOARD_BUSINESSES_PAGE_SIZE = 6;

type RegisteredBusinessesPaginatedGridProps = {
  businesses: RegisteredBusiness[];
  currentUserId: string;
  savedBusinessIds?: string[];
  canSaveBusiness?: boolean;
  pageSize?: number;
};

export function RegisteredBusinessesPaginatedGrid({
  businesses,
  currentUserId,
  savedBusinessIds = [],
  canSaveBusiness = false,
  pageSize = DASHBOARD_BUSINESSES_PAGE_SIZE,
}: RegisteredBusinessesPaginatedGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(businesses.length / pageSize));
  const savedBusinessIdSet = useMemo(
    () => new Set(savedBusinessIds),
    [savedBusinessIds],
  );
  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    if (!Number.isFinite(raw) || raw < 1) {
      return 1;
    }

    return Math.min(Math.floor(raw), totalPages);
  }, [searchParams, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return businesses.slice(start, start + pageSize);
  }, [businesses, currentPage, pageSize]);

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  if (businesses.length === 0) {
    return (
      <p className="text-sm font-medium text-slate-500">
        No registered businesses are available yet.
      </p>
    );
  }

  function buildReviewHref(slug: string) {
    const params = new URLSearchParams();
    params.set("view", "review");
    params.set("business", slug);

    const page = searchParams.get("page");
    if (page && page !== "1") {
      params.set("page", page);
    }

    const currentView = searchParams.get("view");
    if (currentView && currentView !== "review") {
      params.set("from", currentView);
    }

    return `/dashboard/user?${params.toString()}`;
  }

  function buildViewHref(slug: string) {
    const params = new URLSearchParams();
    params.set("view", "view");
    params.set("business", slug);

    const page = searchParams.get("page");
    if (page && page !== "1") {
      params.set("page", page);
    }

    const currentView = searchParams.get("view");
    if (currentView && currentView !== "view") {
      params.set("from", currentView);
    }

    return `/dashboard/user?${params.toString()}`;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, businesses.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((business) => (
          <DashboardBusinessCard
            key={business.id}
            business={business}
            currentUserId={currentUserId}
            initialRatingCount={business.ratingCount}
            viewHref={buildViewHref(business.slug)}
            reviewHref={buildReviewHref(business.slug)}
            canSaveBusiness={canSaveBusiness}
            initialIsSaved={savedBusinessIdSet.has(business.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold text-slate-500">
            Showing {start}–{end} of {businesses.length} businesses
          </p>

          <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="Businesses pagination"
          >
            <PaginationButton
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </PaginationButton>

            {getPageNumbers(currentPage, totalPages).map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-xs font-bold text-slate-400"
                >
                  …
                </span>
              ) : (
                <PaginationButton
                  key={page}
                  active={page === currentPage}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </PaginationButton>
              ),
            )}

            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </PaginationButton>
          </nav>
        </div>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-lg px-3 py-1.5 text-xs font-bold transition",
        active
          ? "bg-[#10206f] text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
}
