"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { BusinessSearchPanel } from "@/components/landing/business-search-panel";
import { SearchIcon, SparkleIcon } from "@/components/landing/icons";
import { StarRating } from "@/components/landing/star-rating";
import { BookmarkIcon } from "@/components/layouts/icons";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type SearchResult = {
  id: string;
  ownerId: string;
  categoryId: string;
  locationId: string;
  businessName: string;
  slug: string;
  description: string | null;
  categoryName: string;
  location: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  relevance: number;
  recommendationScore: number;
  personalizedScore: number;
  url: string;
};

type SearchResponse = {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

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

type CategoryOption = {
  id: string;
  label?: string;
  name: string;
  parentCategory?: { name: string } | null;
};

type LocationOption = {
  id: string;
  city: string;
  stateProvince: string | null;
  country: string;
};

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const pageSize = 3;
const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
];
const ratingOptions = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4.0+" },
  { value: "3", label: "3.0+" },
  { value: "2", label: "2.0+" },
];
const sortOptions = [
  { value: "relevance", label: "AI match" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

function searchParamValue(params: URLSearchParams, key: string) {
  return params.get(key) ?? "";
}

function formatCategory(category: CategoryOption) {
  if (category.label) {
    return category.label;
  }

  return category.parentCategory
    ? `${category.parentCategory.name} / ${category.name}`
    : category.name;
}

function formatLocation(location: LocationOption) {
  return [location.city, location.stateProvince, location.country]
    .filter(Boolean)
    .join(", ");
}

function businessInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] ?? "B"}${words[1]?.[0] ?? words[0]?.[1] ?? ""}`
    .toUpperCase()
    .slice(0, 2);
}

function statusLabel(status: SearchResult["verificationStatus"]) {
  if (status === "UNDER_REVIEW") {
    return "Under review";
  }
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function buildSearchUrl(params: URLSearchParams, basePath: string) {
  const [path, query = ""] = basePath.split("?");
  const nextParams = new URLSearchParams(query);
  for (const [key, value] of params) {
    nextParams.set(key, value);
  }

  const queryString = nextParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function categorySearchHref(categoryId: string, basePath: string) {
  const params = new URLSearchParams({ categoryId });
  return buildSearchUrl(params, basePath);
}

type SearchPageProps = {
  basePath?: string;
  backHref?: string;
  embedded?: boolean;
  showHeroSearch?: boolean;
  showCompactSearch?: boolean;
  savedBusinessIds?: string[];
  resultLinksMode?: "public" | "dashboard";
  allowSaveBusiness?: boolean;
};

export function SearchPage({
  basePath = "/search",
  backHref = "/",
  embedded = false,
  showHeroSearch = true,
  showCompactSearch = false,
  savedBusinessIds = [],
  resultLinksMode = "public",
  allowSaveBusiness = false,
}: SearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const paramsKey = searchParams.toString();
  const currentPage = Number(searchParams.get("page") ?? "1");
  const currentUserId = session?.user?.id ?? null;

  const [query, setQuery] = useState(searchParamValue(searchParams, "q"));
  const [categoryId, setCategoryId] = useState(
    searchParamValue(searchParams, "categoryId"),
  );
  const [locationId, setLocationId] = useState(
    searchParamValue(searchParams, "locationId"),
  );
  const [status, setStatus] = useState(searchParamValue(searchParams, "status"));
  const [minRating, setMinRating] = useState(
    searchParamValue(searchParams, "minRating"),
  );
  const [sort, setSort] = useState(searchParams.get("sort") ?? "relevance");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const [ragAnswer, setRagAnswer] = useState<RagResponse | null>(null);

  const resultLabel = useMemo(() => {
    if (loading) {
      return "Loading results";
    }
    return `${total.toLocaleString()} ${total === 1 ? "result" : "results"}`;
  }, [loading, total]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total],
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );
  const popularCategoryLinks = useMemo(
    () =>
      categories.map((category) => ({
        label: formatCategory(category),
        href: categorySearchHref(category.id, basePath),
      })),
    [basePath, categories],
  );
  const savedBusinessIdSet = useMemo(
    () => new Set(savedBusinessIds),
    [savedBusinessIds],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      const [categoryResponse, locationResponse] = await Promise.all([
        fetch("/api/categories?popular=true"),
        fetch("/api/locations?limit=300"),
      ]);
      const categoryBody = (await categoryResponse.json()) as ApiResult<
        CategoryOption[]
      >;
      const locationBody = (await locationResponse.json()) as ApiResult<
        LocationOption[]
      >;

      if (!cancelled) {
        if (categoryBody.success) {
          setCategories(categoryBody.data);
        }
        if (locationBody.success) {
          setLocations(locationBody.data);
        }
        setOptionsLoading(false);
      }
    }

    void loadOptions().catch(() => {
      if (!cancelled) {
        setOptionsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(paramsKey);
      setQuery(searchParamValue(nextParams, "q"));
      setCategoryId(searchParamValue(nextParams, "categoryId"));
      setLocationId(searchParamValue(nextParams, "locationId"));
      setStatus(searchParamValue(nextParams, "status"));
      setMinRating(searchParamValue(nextParams, "minRating"));
      setSort(nextParams.get("sort") ?? "relevance");
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [paramsKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(paramsKey);
      params.set("limit", String(pageSize));
      if (!params.get("page")) {
        params.set("page", "1");
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      const body = (await response.json()) as ApiResult<SearchResponse>;

      if (!cancelled) {
        setLoading(false);
        if (!body.success) {
          setResults([]);
          setTotal(0);
          setHasMore(false);
          setError(body.error);
          return;
        }

        setResults(body.data.results);
        setTotal(body.data.total);
        setHasMore(body.data.hasMore);
      }
    }

    void loadResults().catch((searchError) => {
      if (!cancelled) {
        setLoading(false);
        setResults([]);
        setTotal(0);
        setHasMore(false);
        setError(
          searchError instanceof Error ? searchError.message : "Search failed",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  function buildParams(nextPage = 1) {
    const nextParams = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) {
      nextParams.set("q", trimmed);
    }
    if (categoryId) {
      nextParams.set("categoryId", categoryId);
    }
    if (locationId) {
      nextParams.set("locationId", locationId);
    }
    if (status) {
      nextParams.set("status", status);
    }
    if (minRating) {
      nextParams.set("minRating", minRating);
    }
    if (sort !== "relevance") {
      nextParams.set("sort", sort);
    }
    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }
    return nextParams;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(buildSearchUrl(buildParams(1), basePath));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(buildSearchUrl(buildParams(1), basePath));
  }

  function resetFilters() {
    setQuery("");
    setCategoryId("");
    setLocationId("");
    setStatus("");
    setMinRating("");
    setSort("relevance");
    router.replace(basePath);
  }

  function goToPage(page: number) {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    router.replace(buildSearchUrl(buildParams(nextPage), basePath));
  }

  useEffect(() => {
    let cancelled = false;
    const nextParams = new URLSearchParams(paramsKey);
    const question = searchParamValue(nextParams, "q").trim();

    if (!question) {
      const clearTimer = window.setTimeout(() => {
        setRagLoading(false);
        setRagError(null);
        setRagAnswer(null);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(clearTimer);
      };
    }

    async function loadRag() {
      if (!cancelled) {
        setRagLoading(true);
        setRagError(null);
      }

      const response = await fetch("/api/search/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          categoryId: searchParamValue(nextParams, "categoryId") || undefined,
          locationId: searchParamValue(nextParams, "locationId") || undefined,
          status: searchParamValue(nextParams, "status") || undefined,
          minRating: searchParamValue(nextParams, "minRating")
            ? Number(searchParamValue(nextParams, "minRating"))
            : undefined,
        }),
      });

      const body = (await response.json()) as ApiResult<RagResponse>;
      if (cancelled) {
        return;
      }

      setRagLoading(false);
      if (!body.success) {
        setRagError(body.error);
        setRagAnswer(null);
        return;
      }

      setRagAnswer(body.data);
    }

    void loadRag().catch((ragFetchError) => {
      if (!cancelled) {
        setRagLoading(false);
        setRagAnswer(null);
        setRagError(
          ragFetchError instanceof Error ? ragFetchError.message : "AI search failed",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  return (
    <div className={embedded ? "bg-[#f4f7fb]" : "min-h-screen bg-[#f4f7fb]"}>
      {showHeroSearch && (
        <section
          className={
            embedded
              ? "rounded-xl bg-[#111d63] px-5 py-10 text-white sm:px-8"
              : "bg-[#111d63] px-5 py-14 text-white sm:px-8 lg:py-18"
          }
        >
          <BusinessSearchPanel
            query={query}
            loading={loading}
            categories={popularCategoryLinks}
            onQueryChange={setQuery}
            onSubmit={submitSearch}
            backHref={backHref}
          />
        </section>
      )}

      <section
        className={
          embedded
            ? "grid gap-8 py-8 lg:grid-cols-[280px_1fr]"
            : "mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[280px_1fr]"
        }
      >
        <aside>
          <form
            onSubmit={applyFilters}
            className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Filters
            </h2>
            <div className="mt-6 space-y-4">
              <FilterSelect
                label="Category"
                value={categoryId}
                onChange={setCategoryId}
                disabled={optionsLoading}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {formatCategory(category)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Location"
                value={locationId}
                onChange={setLocationId}
                disabled={optionsLoading}
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {formatLocation(location)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect label="Verification" value={status} onChange={setStatus}>
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Minimum rating"
                value={minRating}
                onChange={setMinRating}
              >
                {ratingOptions.map((option) => (
                  <option key={option.value || "any"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect label="Sort by" value={sort} onChange={setSort}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FilterSelect>
            </div>

            <Button type="submit" className="mt-6 min-h-11 w-full font-extrabold">
              Apply filters
            </Button>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Reset
            </button>
          </form>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">{resultLabel}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                All registered businesses
              </h2>
            </div>
            {showCompactSearch ? (
              <CompactSearchForm
                query={query}
                loading={loading}
                onQueryChange={setQuery}
                onSubmit={submitSearch}
              />
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700">
                <SparkleIcon className="size-4 text-orange-400" />
                Ranked by AI match
              </span>
            )}
          </div>

          {(ragLoading || ragError || ragAnswer) && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                  AI summary
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <SparkleIcon className="size-3.5" />
                  RAG powered
                </span>
              </div>
              {ragLoading ? (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Thinking about your search...
                </p>
              ) : ragError ? (
                <p className="mt-3 text-sm font-semibold text-red-600">{ragError}</p>
              ) : ragAnswer ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Answer for:{" "}
                    <span className="text-slate-700">{ragAnswer.question}</span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{ragAnswer.answer}</p>
                  {ragAnswer.citations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Sources
                      </p>
                      <div className="mt-2 space-y-2">
                        {ragAnswer.citations.map((source) => (
                          <Link
                            key={source.id}
                            href={`${source.url}?mode=view`}
                            className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-[#111d63]/40 hover:bg-[#111d63]/5"
                          >
                            <p className="font-bold text-slate-900">{source.businessName}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {source.categoryName} · {source.location} ·{" "}
                              {source.rating > 0
                                ? `${source.rating.toFixed(1)} (${source.reviewCount})`
                                : "No ratings"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 space-y-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
                  />
                ))
              : results.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    currentUserId={currentUserId}
                    initialIsSaved={savedBusinessIdSet.has(result.id)}
                    linksMode={resultLinksMode}
                    allowSaveBusiness={allowSaveBusiness}
                  />
                ))}
          </div>

          {!loading && results.length === 0 && !error && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="text-lg font-black text-slate-950">
                No businesses found
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Try a different search term or loosen your filters.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
              aria-label="Search results pagination"
            >
              <PaginationButton
                disabled={currentPage <= 1 || loading}
                onClick={() => goToPage(currentPage - 1)}
              >
                Prev
              </PaginationButton>

              {pageNumbers.map((page, index) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-sm font-black text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <PaginationButton
                    key={page}
                    active={page === currentPage}
                    disabled={loading}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </PaginationButton>
                ),
              )}

              <PaginationButton
                disabled={!hasMore || loading}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </PaginationButton>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}

function CompactSearchForm({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-11 w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:w-[360px]"
    >
      <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <SearchIcon className="size-4 shrink-0 text-slate-400" />
        <span className="sr-only">Search businesses</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search businesses..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-w-20 bg-[#111d63] px-4 text-sm font-black text-white transition hover:bg-[#27339a] disabled:cursor-wait disabled:opacity-70"
      >
        Search
      </button>
    </form>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-[#27339a] focus:ring-4 focus:ring-[#27339a]/10 disabled:cursor-wait disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

function SearchResultCard({
  result,
  currentUserId,
  initialIsSaved = false,
  linksMode = "public",
  allowSaveBusiness = false,
}: {
  result: SearchResult;
  currentUserId?: string | null;
  initialIsSaved?: boolean;
  linksMode?: "public" | "dashboard";
  allowSaveBusiness?: boolean;
}) {
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<"review" | "save">("review");
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();
  const matchScore = Math.max(
    result.personalizedScore,
    result.recommendationScore,
  );
  const detailsHref =
    linksMode === "dashboard"
      ? `/dashboard/user?view=view&business=${encodeURIComponent(result.slug)}&from=businesses`
      : `${result.url}?mode=view`;
  const reviewHref =
    linksMode === "dashboard"
      ? `/dashboard/user?view=review&business=${encodeURIComponent(result.slug)}&from=businesses`
      : `${result.url}?mode=review#reviews`;
  const isLoggedIn = Boolean(currentUserId);
  const isOwner = Boolean(currentUserId && currentUserId === result.ownerId);
  const encodedReviewHref = encodeURIComponent(reviewHref);
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
    const response = await fetch(`/api/businesses/${result.id}/saved`, {
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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-950">
          {businessInitials(result.businessName)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-950">
              <Link href={detailsHref} className="hover:text-[#111d63]">
                {result.businessName}
              </Link>
            </h3>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-black",
                result.isVerified || result.verificationStatus === "APPROVED"
                  ? "bg-[#111d63] text-white"
                  : "border border-slate-200 text-slate-600",
              ].join(" ")}
            >
              {result.isVerified ? "Verified" : statusLabel(result.verificationStatus)}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {result.categoryName} · {result.location}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarRating rating={result.rating} size="sm" />
            <span className="text-sm font-bold text-slate-700">
              {result.rating > 0 ? result.rating.toFixed(1) : "No ratings yet"}
            </span>
            {result.reviewCount > 0 && (
              <span className="text-sm font-medium text-slate-500">
                {result.reviewCount} reviews
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm font-black text-[#27339a]">
              <SparkleIcon className="size-4 text-orange-400" />
              AI match {(matchScore * 100).toFixed(0)}%
            </span>
          </div>
          {result.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {result.description}
            </p>
          )}
          {saveError && (
            <p className="mt-2 text-xs font-semibold text-red-600">{saveError}</p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:w-32 sm:flex-col sm:items-stretch">
          {allowSaveBusiness && (
            <button
              type="button"
              onClick={() => void toggleSaved()}
              disabled={isSaving}
              title={isSaved ? "Remove from saved businesses" : "Save business"}
              aria-label={isSaved ? "Remove from saved businesses" : "Save business"}
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold shadow-sm transition sm:self-end ${
                isSaved
                  ? "border-[#111d63] bg-[#111d63] text-white"
                  : "border-slate-200 bg-white text-[#111d63] hover:border-[#111d63]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <BookmarkIcon className="size-4" />
            </button>
          )}
          <Link
            href={detailsHref}
            className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:border-[#111d63] hover:text-[#111d63]"
          >
            View
          </Link>
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                setAuthPromptAction("review");
                setIsAuthPromptOpen(true);
              }}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-[#111d63] px-3 text-xs font-black text-white transition hover:bg-[#27339a]"
            >
              Review
            </button>
          ) : (
            <Link
              href={reviewHref}
              className={[
                "inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-black text-white transition",
                isOwner
                  ? "pointer-events-none bg-slate-400"
                  : "bg-[#111d63] hover:bg-[#27339a]",
              ].join(" ")}
              aria-disabled={isOwner}
            >
              {isOwner ? "Owner" : "Review"}
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
        "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-black shadow-sm transition",
        active
          ? "bg-[#111d63] text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled ? "cursor-not-allowed opacity-45" : "",
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
