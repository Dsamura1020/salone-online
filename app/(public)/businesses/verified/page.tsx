import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { RegisteredBusinessCard } from "@/components/businesses/registered-business-card";
import { ShieldIcon } from "@/components/landing/icons";
import { getSession } from "@/lib/auth/auth";
import { getVerifiedBusinesses } from "@/lib/business/registered-businesses";

export const dynamic = "force-dynamic";

export default async function VerifiedBusinessesPage() {
  const [businesses, session] = await Promise.all([
    getVerifiedBusinesses(),
    getSession(),
  ]);
  const currentUserId = session?.user?.id ?? null;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7fb_100%)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
              <ShieldIcon className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                Verified Businesses
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse businesses that have passed admin verification and carry the
                verified badge on our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {businesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-700">
                No verified businesses yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Verified listings will appear here after admin approval.
              </p>
              <Link
                href="/businesses"
                className="mt-6 inline-flex rounded-lg border border-[#111d63] px-5 py-2.5 text-sm font-bold text-[#111d63] hover:bg-[#111d63]/5"
              >
                View all businesses
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
