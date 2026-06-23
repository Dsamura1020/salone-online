import { Suspense } from "react";
import { SearchPage } from "@/features/search/components/search-page";

export default function PublicSearchPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <Suspense fallback={<div className="px-6 py-10 text-sm text-zinc-500">Loading search…</div>}>
        <SearchPage />
      </Suspense>
    </main>
  );
}
