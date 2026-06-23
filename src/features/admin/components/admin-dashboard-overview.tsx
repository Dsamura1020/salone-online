import Link from "next/link";
import type {
  AdminCategorySlice,
  AdminDashboardData,
  AdminPlatformHealth,
  AdminReviewPreview,
  AdminStatCard,
  AdminVerificationPreview,
} from "@/lib/admin/dashboard-data";
import { relativeTime } from "@/lib/admin/dashboard-data";
import {
  BuildingIcon,
  MessageIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
} from "@/components/layouts/icons";

type AdminDashboardOverviewProps = {
  data: AdminDashboardData;
};

const statIcons = [UsersIcon, BuildingIcon, ShieldIcon, MessageIcon];

export function AdminDashboardOverview({ data }: AdminDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} icon={statIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <VerificationQueueCard items={data.verificationQueue} />
        <PlatformHealthCard items={data.platformHealth} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <RecentReviewsCard items={data.recentReviews} />
        <CategoryChartCard
          categories={data.categories}
          totalBusinesses={data.totalBusinesses}
        />
      </section>
    </div>
  );
}

function StatCard({
  stat,
  icon: Icon,
}: {
  stat: AdminStatCard;
  icon: typeof UsersIcon;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            {stat.value.toLocaleString()}
          </p>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="size-5" />
        </span>
      </div>
      <p
        className={`mt-4 text-sm font-semibold ${
          stat.trend === 0
            ? "text-slate-500"
            : stat.positive
              ? "text-emerald-600"
              : "text-rose-500"
        }`}
      >
        {stat.trend === 0
          ? "No change from last week"
          : `${stat.positive ? "↑" : "↓"} ${Math.abs(stat.trend)}% ${stat.trendLabel}`}
      </p>
    </article>
  );
}

function VerificationQueueCard({
  items,
}: {
  items: AdminVerificationPreview[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Pending Verification Queue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Businesses awaiting admin review
          </p>
        </div>
        <Link
          href="/dashboard/admin/verification"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View All Verifications
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No pending verification requests.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <BuildingIcon className="size-5" />
                  </span>
                  <div>
                    <Link
                      href={`/dashboard/admin/verification/${item.id}`}
                      className="font-semibold text-slate-950 hover:text-indigo-600"
                    >
                      {item.businessName}
                    </Link>
                    <p className="text-sm text-slate-500">{item.categoryName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {item.status}
                  </span>
                  <p className="mt-2 text-xs text-slate-400">
                    {relativeTime(item.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${item.progress}%` }}
                  title={`${item.documentCount} document${item.documentCount === 1 ? "" : "s"} uploaded`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {item.documentCount} document{item.documentCount === 1 ? "" : "s"} uploaded ·{" "}
                {item.progress}% complete
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PlatformHealthCard({ items }: { items: AdminPlatformHealth[] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Platform Health</h2>
      <p className="mt-1 text-sm text-slate-500">Operational performance metrics</p>

      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
            </div>
            <Sparkline tone={item.tone} points={item.sparkline} />
          </li>
        ))}
      </ul>
    </article>
  );
}

function Sparkline({
  tone,
  points,
}: {
  tone: "good" | "warn";
  points: number[];
}) {
  const stroke = tone === "good" ? "#10b981" : "#f59e0b";
  const max = Math.max(...points, 1);
  const normalized = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 84;
    const y = 32 - (point / max) * 24;
    return `${x},${y}`;
  });

  if (points.every((point) => point === 0)) {
    return (
      <svg width="84" height="36" viewBox="0 0 84 36" aria-hidden="true">
        <line
          x1="0"
          y1="24"
          x2="84"
          y2="24"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="84" height="36" viewBox="0 0 84 36" aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={normalized.join(" ")}
      />
    </svg>
  );
}

function RecentReviewsCard({ items }: { items: AdminReviewPreview[] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Recent Reviews to Moderate
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest flagged and pending reviews
          </p>
        </div>
        <Link
          href="/dashboard/admin/reviews"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View All Reviews
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews in the moderation queue.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {item.userInitials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{item.userName}</p>
                  <p className="text-sm text-slate-500">{item.businessName}</p>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {item.rating ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <StarIcon
                          key={index}
                          className={`size-3.5 ${
                            index < item.rating!
                              ? "fill-current"
                              : "opacity-30"
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        No rating submitted
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {item.excerpt}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                  {item.moderationStatus}
                </span>
                <p className="mt-2 text-xs text-slate-400">
                  {relativeTime(item.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CategoryChartCard({
  categories,
  totalBusinesses,
}: {
  categories: AdminCategorySlice[];
  totalBusinesses: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const categorySegments = categories.map((category) => {
    const segment = (category.percentage / 100) * circumference;
    return {
      category,
      segment,
    };
  });

  const circles = categorySegments.map(({ category, segment }, index) => {
    const offset = categorySegments
      .slice(0, index)
      .reduce((sum, item) => sum + item.segment, 0);

    return (
      <circle
        key={category.name}
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={category.color}
        strokeWidth="16"
        strokeDasharray={`${segment} ${circumference - segment}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Businesses by Category</h2>
      <p className="mt-1 text-sm text-slate-500">Distribution across the platform</p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">
            No businesses have been registered yet.
          </p>
        ) : (
          <>
            <div className="relative size-40">
          <svg viewBox="0 0 140 140" className="size-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
            />
            {circles}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-slate-950">
              {totalBusinesses.toLocaleString()}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </p>
          </div>
        </div>

        <ul className="flex-1 space-y-3">
          {categories.map((category) => (
            <li
              key={category.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-slate-700">{category.name}</span>
              </div>
              <span className="font-bold text-slate-950">
                {category.percentage}%
              </span>
            </li>
          ))}
        </ul>
          </>
        )}
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/dashboard/admin/analytics"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View Detailed Report
        </Link>
      </div>
    </article>
  );
}
