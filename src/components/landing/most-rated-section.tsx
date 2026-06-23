import Link from "next/link";
import type { LandingBusiness } from "@/lib/landing/landing-data";
import { RegisteredBusinessCard } from "@/components/businesses/registered-business-card";

type MostRatedSectionProps = {
  businesses: LandingBusiness[];
  currentUserId?: string | null;
};

export function MostRatedSection({
  businesses,
  currentUserId,
}: MostRatedSectionProps) {
  return (
    <section id="businesses" className="border-b border-slate-200 bg-[#f4f7fb] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-black text-slate-950">Most Rated Businesses</h2>
          <Link
            href="/businesses"
            className="text-xs font-bold text-[#111d63] transition hover:text-[#27339a]"
          >
            View all businesses →
          </Link>
        </div>

        {businesses.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Top-rated businesses (2.0–5.0) will appear here once ratings are in.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {businesses.map((business) => (
              <RegisteredBusinessCard
                key={business.id}
                business={business}
                currentUserId={currentUserId}
                initialRatingCount={business.ratingCount}
                requireLoginForReview
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

}
