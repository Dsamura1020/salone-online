"use client";

import { useCallback, useState } from "react";
import type { SearchResult } from "../business-search";

type SearchResponse = {
  data: { results: SearchResult[] };
  error?: string;
  success?: boolean;
};

export function useBusinessSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string, limit = 10) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed, limit }),
      });

      const body = (await response.json()) as SearchResponse;

      if (!response.ok) {
        setResults([]);
        setError(body.error ?? "Search failed");
        return;
      }

      setResults(body.data.results ?? []);
    } catch {
      setResults([]);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    hasSearched,
    search,
    reset,
  };
}
