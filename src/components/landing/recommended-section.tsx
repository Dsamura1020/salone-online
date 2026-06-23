import Link from "next/link";
import { ArrowRightIcon } from "./icons";

const recommendations = [
  {
    title: "Top ICT Companies",
    query: "ICT Services",
    iconBg: "bg-violet-100 text-violet-600",
    emoji: "💻",
  },
  {
    title: "Best Restaurants",
    query: "Restaurants",
    iconBg: "bg-orange-100 text-orange-600",
    emoji: "🍽️",
  },
  {
    title: "Trusted Health Clinics",
    query: "Health",
    iconBg: "bg-emerald-100 text-emerald-600",
    emoji: "🏥",
  },
  {
    title: "Leading Schools",
    query: "Education",
    iconBg: "bg-sky-100 text-sky-600",
    emoji: "🎓",
  },
];

export function RecommendedSection() {
  return (
    <section id="categories" className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-black text-slate-950">Recommended For You</h2>
          <Link
            href="/search"
            className="text-xs font-bold text-[#111d63] transition hover:text-[#27339a]"
          >
            View all recommendations →
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recommendations.map((item) => (
            <Link
              key={item.title}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-[#111d63]/20 hover:shadow-md"
            >
              <span
                className={[
                  "flex size-11 shrink-0 items-center justify-center rounded-xl text-lg",
                  item.iconBg,
                ].join(" ")}
              >
                {item.emoji}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-950">{item.title}</span>
                <ArrowRightIcon className="size-3.5 shrink-0 text-slate-400 transition group-hover:text-[#111d63]" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
