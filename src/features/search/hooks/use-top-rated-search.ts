"use client";

import { useCallback, useState } from "react";
import type { RegisteredBusiness } from "@/lib/business/registered-business-types";

type TopRatedResponse = {
  data: { businesses: RegisteredBusiness[] };
  error?: string;
  success?: boolean;
};

export function useTopRatedSearch() {
  const [businesses, setBusinesses] = useState<RegisteredBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string, limit = 8) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setBusinesses([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: trimmed,
        limit: String(limit),
      });
      const response = await fetch(`/api/businesses/top-rated?${params.toString()}`);
      const body = (await response.json()) as TopRatedResponse;

      if (!response.ok) {
        setBusinesses([]);
        setError(body.error ?? "Search failed");
        return;
      }

      setBusinesses(body.data.businesses ?? []);
    } catch {
      setBusinesses([]);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    businesses,
    loading,
    error,
    hasSearched,
    search,
  };
}
