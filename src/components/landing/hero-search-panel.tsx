"use client";

import { useState } from "react";
import { useTopRatedSearch } from "@/features/search/hooks/use-top-rated-search";
import type { PopularCategoryLink } from "@/lib/landing/popular-categories";
import { BusinessSearchPanel } from "./business-search-panel";
import { HeroSearchResultsPopup } from "./hero-search-results-popup";

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

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function HeroSearchPanel({
  quickCategories,
}: {
  quickCategories: PopularCategoryLink[];
}) {
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const [ragAnswer, setRagAnswer] = useState<RagResponse | null>(null);
  const { businesses, loading, error, hasSearched, search } = useTopRatedSearch();

  async function askAi(searchQuery: string) {
    setRagLoading(true);
    setRagError(null);
    setRagAnswer(null);
    try {
      const response = await fetch("/api/search/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: searchQuery }),
      });
      const body = (await response.json()) as ApiResult<RagResponse>;
      if (!response.ok || !body.success) {
        setRagError(body.success ? "AI search failed" : body.error);
        return;
      }
      setRagAnswer(body.data);
    } catch {
      setRagError("AI search failed");
    } finally {
      setRagLoading(false);
    }
  }

  async function runSearch(searchQuery: string) {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    setSearchPending(true);
    setResultsOpen(true);
    try {
      await Promise.all([search(trimmed), askAi(trimmed)]);
    } finally {
      setSearchPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(query);
  }

  async function onCategorySelect(category: PopularCategoryLink) {
    setQuery(category.label);
    await runSearch(category.label);
  }

  function closeResults() {
    setResultsOpen(false);
  }

  return (
    <>
      <BusinessSearchPanel
        query={query}
        loading={loading}
        categories={quickCategories}
        onQueryChange={setQuery}
        onSubmit={(event) => void onSubmit(event)}
        onCategorySelect={(category) => void onCategorySelect(category)}
      />

      <HeroSearchResultsPopup
        open={resultsOpen}
        query={query}
        loading={loading}
        searchPending={searchPending}
        ragLoading={ragLoading}
        ragError={ragError}
        ragAnswer={ragAnswer}
        error={error}
        hasSearched={hasSearched}
        businesses={businesses}
        onClose={closeResults}
      />
    </>
  );
}
