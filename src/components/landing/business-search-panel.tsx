"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { SearchIcon, ArrowRightIcon } from "./icons";

export type BusinessSearchCategory = {
  label: string;
  href: string;
};

type BusinessSearchPanelProps = {
  query: string;
  loading?: boolean;
  categories: BusinessSearchCategory[];
  onQueryChange: (query: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCategorySelect?: (category: BusinessSearchCategory) => void;
  backHref?: string;
  backLabel?: string;
};

export function BusinessSearchPanel({
  query,
  loading = false,
  categories,
  onQueryChange,
  onSubmit,
  onCategorySelect,
  backHref,
  backLabel = "Back to home",
}: BusinessSearchPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
      {backHref && (
        <Link
          href={backHref}
          className="mb-8 inline-flex w-fit items-center gap-3 self-start text-base font-bold text-white/72 transition hover:text-white"
        >
          <ArrowRightIcon className="size-5 rotate-180" />
          {backLabel}
        </Link>
      )}

      <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white/85">
        AI Search • Verified Listings
      </span>

      <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
        Search for trusted businesses in Sierra Leone
      </h1>
      <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-white/75 sm:text-xl">
        Find restaurants, services, shops, and verified providers by name,
        category, or location.
      </p>

      <div className="mt-10 w-full max-w-4xl">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-white p-2 shadow-2xl shadow-slate-950/20"
        >
          <label className="flex min-h-16 items-center gap-3">
            <SearchIcon className="ml-3 size-6 shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="What are you looking for?"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 sm:text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="mr-0.5 min-h-12 rounded-xl bg-[#202a86] px-6 text-sm font-extrabold text-white transition hover:bg-[#111d63] disabled:opacity-60 sm:px-8 sm:text-base"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </label>
        </form>

        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {categories.map((category) =>
              onCategorySelect ? (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => onCategorySelect(category)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 transition hover:border-white/35 hover:bg-white/15"
                >
                  {category.label}
                </button>
              ) : (
                <Link
                  key={category.label}
                  href={category.href}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 transition hover:border-white/35 hover:bg-white/15"
                >
                  {category.label}
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
