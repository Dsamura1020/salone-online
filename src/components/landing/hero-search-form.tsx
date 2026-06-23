"use client";

import { useState } from "react";
import { BusinessSearchResultCard } from "@/features/search/components/business-search-result-card";
import { useBusinessSearch } from "@/features/search/hooks/use-business-search";
import { SearchIcon } from "./icons";

export function HeroSearchForm() {
  const [query, setQuery] = useState("");
  const { results, loading, error, hasSearched, search } = useBusinessSearch();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await search(query);
  }

  return (
    <div className="mt-10 max-w-3xl">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="rounded-2xl bg-white p-2 shadow-2xl shadow-slate-950/30"
      >
        <label className="flex min-h-16 items-center gap-4">
          <SearchIcon className="ml-4 size-6 shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search businesses..."
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="mr-0.5 min-h-14 rounded-xl bg-[#202a86] px-8 text-base font-extrabold text-white transition hover:bg-[#111d63] disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </label>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      )}

      {hasSearched && !loading && !error && results.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white/85">
          No matching businesses found.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-bold uppercase tracking-wide text-white/70">
            {results.length} result{results.length === 1 ? "" : "s"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((result) => (
              <BusinessSearchResultCard
                key={result.id}
                result={result}
                variant="hero"
                descriptionMaxLength={120}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
