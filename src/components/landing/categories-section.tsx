import Link from "next/link";
import type { PopularCategoryLink } from "@/lib/landing/popular-categories";
import { ArrowRightIcon } from "./icons";

export function CategoriesSection({
  categories,
}: {
  categories: PopularCategoryLink[];
}) {
  return (
    <section id="categories" className="border-b border-slate-200 bg-[#eef3fa] py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#111d63]">
              Explore
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
              Popular categories
            </h2>
          </div>
          <p className="max-w-xl text-lg font-medium leading-8 text-slate-500 lg:justify-self-end">
            Browse by sector to find the right business across Sierra Leone.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.label} className="group relative">
              <Link
                href={category.href}
                className="flex min-h-24 items-center justify-between rounded-2xl border border-slate-200 bg-white px-7 shadow-sm transition hover:-translate-y-1 hover:border-[#202a86]/30 hover:shadow-xl hover:shadow-slate-200/80 group-focus-visible:ring-2 group-focus-visible:ring-[#111d63]/20"
              >
                <span className="text-xl font-extrabold text-slate-950">
                  {category.label}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 group-hover:text-[#111d63]">
                  Explore
                  <ArrowRightIcon className="size-4" />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
