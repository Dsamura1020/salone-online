import { HeroSearchPanel } from "./hero-search-panel";
import type { PopularCategoryLink } from "@/lib/landing/popular-categories";

export function HeroSection({
  quickCategories,
}: {
  quickCategories: PopularCategoryLink[];
}) {
  return (
    <section className="border-b border-slate-200 bg-[#111d63]">
      <div className="w-full">
        <div className="flex min-h-[420px] items-center bg-[#111d63] px-5 py-12 text-white sm:min-h-[470px] sm:px-8 lg:min-h-[520px] lg:px-12">
          <HeroSearchPanel quickCategories={quickCategories} />
        </div>
      </div>
    </section>
  );
}
