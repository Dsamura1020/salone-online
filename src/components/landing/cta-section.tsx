import Link from "next/link";
import { TrendingIcon } from "./icons";

export function CtaSection() {
  return (
    <section className="bg-[#f4f7fb] px-4 py-6 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[linear-gradient(115deg,#081654,#202a86_58%,#3d4db8)] px-5 py-10 text-white shadow-lg shadow-[#111d63]/15 sm:px-8 sm:py-12">
        <div className="pointer-events-none absolute -right-8 top-0 hidden h-full w-1/2 opacity-30 lg:block">
          <TrendingIcon className="absolute right-10 top-6 size-24 text-white/20" />
        </div>

        <div className="relative max-w-xl">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Grow Your Business
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-white/75 sm:text-base">
            Join thousands of verified businesses and reach more customers through
            AI-Powered Web discovery.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/login?mode=register-business&callbackUrl=/dashboard/owner/businesses/new"
              className="inline-flex min-h-10 items-center rounded-lg bg-white px-5 text-sm font-extrabold text-[#111d63] transition hover:bg-slate-100"
            >
              Register Business
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-10 items-center rounded-lg border border-white/30 px-5 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
