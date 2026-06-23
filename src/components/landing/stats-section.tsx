import type { LandingStats } from "@/lib/landing/landing-data";
import { BuildingIcon, SearchIcon, ShieldIcon } from "./icons";

type StatsSectionProps = {
  stats: LandingStats;
};

export function StatsSection({ stats }: StatsSectionProps) {
  const cards = [
    {
      label: "Businesses Listed",
      value: stats.businessesListed.toLocaleString(),
      detail:
        stats.monthlyGrowthPercent >= 0
          ? `Up ${stats.monthlyGrowthPercent}% this month`
          : `${stats.monthlyGrowthPercent}% this month`,
      Icon: BuildingIcon,
    },
    {
      label: "Verified Accounts",
      value: stats.verifiedAccounts.toLocaleString(),
      detail: "Trusted by users",
      Icon: ShieldIcon,
    },
    {
      label: "New Listings",
      value: stats.newThisMonth.toLocaleString(),
      detail: "Added this month",
      Icon: SearchIcon,
    },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const { Icon } = card;

          return (
            <article
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{card.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{card.detail}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-[#111d63]">
                  <Icon className="size-5" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
