import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { RegisteredBusinessCard } from "@/components/businesses/registered-business-card";
import { BuildingIcon } from "@/components/landing/icons";
import { getSession } from "@/lib/auth/auth";
import { getRegisteredBusinesses } from "@/lib/business/registered-businesses";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ focus?: string }>;
};

export default async function RegisteredBusinessesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const focusReviews = params?.focus === "reviews";
  const [businesses, session] = await Promise.all([
    getRegisteredBusinesses(),
    getSession(),
  ]);
  const currentUserId = session?.user?.id ?? null;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Header />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7fb_100%)] px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 opacity-20 lg:block">
          <div className="absolute right-8 top-6 flex gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="inline-block w-8 rounded-t-md bg-slate-300"
                style={{ height: `${80 + index * 18}px` }}
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#111d63] text-white shadow-md">
              <BuildingIcon className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                {focusReviews ? "Rate & Review Businesses" : "Registered Businesses"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {focusReviews
                  ? "Click the stars on any business to rate instantly. No sign-in required. Business owners cannot rate their own listing."
                  : "Explore verified businesses registered on our platform. Discover trusted services and connect with top-rated businesses near you."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="registered-businesses-grid"
        className="scroll-mt-20 px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          {businesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-700">
                No registered businesses yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Approved businesses will appear here once verification is complete.
              </p>
              <Link
                href="/login?mode=register-business&callbackUrl=/dashboard/owner/businesses/new"
                className="mt-6 inline-flex rounded-lg bg-[#111d63] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#27339a]"
              >
                Register your business
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {businesses.map((business) => (
                <RegisteredBusinessCard
                  key={business.id}
                  business={business}
                  currentUserId={currentUserId}
                  initialRatingCount={business.ratingCount}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
