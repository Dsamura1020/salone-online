"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Metric = { value: number; trend: number; positive: boolean };

type AnalyticsSummary = {
  users: Metric;
  businesses: Metric;
  pendingVerifications: Metric;
  totalVerifications: Metric;
  flaggedReviews: Metric;
  approvedReviews: Metric;
};

type Category = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

type Registration = {
  date: string;
  label: string;
  count: number;
};

type DateRange = { from: string; to: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function formatDisplayRange(from: string, to: string): string {
  const fmt = (s: string) =>
    new Date(s + "T12:00:00").toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

type IconProps = { className?: string; style?: React.CSSProperties };

function IcoUsers({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IcoBusiness({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IcoClock({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IcoShield({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IcoFlag({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IcoThumbUp({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function IcoCalendar({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IcoDownload({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const PRESETS = [
    { label: "Last 7 days", from: daysAgoStr(6), to: todayStr() },
    { label: "Last 14 days", from: daysAgoStr(13), to: todayStr() },
    { label: "Last 30 days", from: daysAgoStr(29), to: todayStr() },
    { label: "Last 90 days", from: daysAgoStr(89), to: todayStr() },
  ];

  function apply() {
    if (draft.from && draft.to && draft.from <= draft.to) {
      onChange(draft);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setOpen((o) => !o);
        }}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <IcoCalendar className="size-4 text-slate-500" />
        {formatDisplayRange(value.from, value.to)}
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Select
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  const r = { from: p.from, to: p.to };
                  setDraft(r);
                  onChange(r);
                  setOpen(false);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  value.from === p.from && value.to === p.to
                    ? "border-[#10206f] bg-[#10206f] text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Custom Range
          </p>
          <div className="space-y-2">
            <label className="block">
              <span className="mb-0.5 block text-xs font-semibold text-slate-600">From</span>
              <input
                type="date"
                max={draft.to}
                value={draft.from}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#10206f]"
              />
            </label>
            <label className="block">
              <span className="mb-0.5 block text-xs font-semibold text-slate-600">To</span>
              <input
                type="date"
                min={draft.from}
                max={todayStr()}
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#10206f]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={apply}
            className="mt-3 w-full rounded-lg bg-[#10206f] py-2 text-xs font-bold text-white hover:bg-[#172d92]"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type KPIConfig = {
  key: keyof AnalyticsSummary;
  label: string;
  icon: React.ComponentType<IconProps>;
  iconBg: string;
  iconColor: string;
};

const KPI_CONFIG: KPIConfig[] = [
  { key: "users",               label: "Users",                  icon: IcoUsers,    iconBg: "#dbeafe", iconColor: "#1d4ed8" },
  { key: "businesses",          label: "Registered Businesses",  icon: IcoBusiness, iconBg: "#dcfce7", iconColor: "#15803d" },
  { key: "pendingVerifications",label: "Pending Verifications",  icon: IcoClock,    iconBg: "#fed7aa", iconColor: "#c2410c" },
  { key: "totalVerifications",  label: "Total Verifications",    icon: IcoShield,   iconBg: "#ede9fe", iconColor: "#6d28d9" },
  { key: "flaggedReviews",      label: "Flagged Reviews",        icon: IcoFlag,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { key: "approvedReviews",     label: "Approved Reviews",       icon: IcoThumbUp,  iconBg: "#dcfce7", iconColor: "#15803d" },
];

function KPICard({
  config,
  metric,
  loading,
}: {
  config: KPIConfig;
  metric: Metric | undefined;
  loading: boolean;
}) {
  const Icon = config.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-500">{config.label}</p>
          {loading || !metric ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1.5 text-4xl font-bold tracking-tight text-slate-950">
              {metric.value.toLocaleString()}
            </p>
          )}
        </div>
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: config.iconBg }}
        >
          <Icon className="size-5" style={{ color: config.iconColor }} />
        </span>
      </div>

      {loading || !metric ? (
        <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-100" />
      ) : (
        <p
          className={`mt-3 flex items-center gap-1 text-sm font-semibold ${
            metric.positive ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          <span>{metric.positive ? "↑" : "↓"}</span>
          <span>{Math.abs(metric.trend)}% vs last week</span>
        </p>
      )}
    </article>
  );
}

// ─── Category Donut Chart ─────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function CategoryChart({
  data,
  total,
  loading,
}: {
  data: Category[];
  total: number;
  loading: boolean;
}) {
  const hasData = data.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
          <span className="text-slate-400">◕</span> Businesses by Category
        </h2>
        <Link
          href="/dashboard/admin/businesses"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-6">
          <div className="size-40 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-400">No business data yet</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            {/* Donut chart */}
            <div className="relative mx-auto shrink-0 sm:mx-0" style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: unknown, name: unknown) => [
                      typeof value === "number" ? value.toLocaleString() : String(value),
                      String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold leading-none text-slate-950">
                  {data.reduce((s, c) => s + c.count, 0).toLocaleString()}
                </span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Total
                </span>
              </div>
            </div>

            {/* Legend */}
            <ul className="flex-1 space-y-2.5 pt-1">
              {data.map((cat) => (
                <li key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-950">{cat.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer total */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-500">Total Businesses</span>
            <span className="text-sm font-bold text-slate-950">{total.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Registration Bar Chart ───────────────────────────────────────────────────

function RegistrationChart({
  data,
  loading,
}: {
  data: Registration[];
  loading: boolean;
}) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
          <span className="text-slate-400">📊</span> Business Registrations Over Time
        </h2>
        <Link
          href="/dashboard/admin/analytics?tab=reports"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View Report
        </Link>
      </div>

      {loading ? (
        <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
      ) : !hasData ? (
        <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">
              No registrations in this period
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try selecting a wider date range
            </p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: unknown) => [
                  typeof value === "number" ? value.toLocaleString() : String(value),
                  "Registrations",
                ]}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60}>
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-block size-3 rounded-sm bg-[#3b82f6]" />
            <span className="text-xs font-semibold text-slate-500">Registered Businesses</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm font-semibold text-red-700">
        Failed to load analytics data.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Export helper ────────────────────────────────────────────────────────────

async function runExport(
  dateRange: DateRange,
  summary: AnalyticsSummary | null,
  categories: Category[],
  registrations: Registration[],
  setExporting: (v: boolean) => void,
  setMsg: (msg: { text: string; ok: boolean } | null) => void,
) {
  setExporting(true);
  setMsg(null);

  try {
    // Build a comprehensive CSV in the browser
    const rows: string[] = [
      "SaloneOnline Analytics Report",
      `Date Range: ${dateRange.from} to ${dateRange.to}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "=== KPI SUMMARY ===",
      "Metric,Value,Trend (%),Direction",
    ];

    if (summary) {
      const kpis: [string, Metric][] = [
        ["Users", summary.users],
        ["Registered Businesses", summary.businesses],
        ["Pending Verifications", summary.pendingVerifications],
        ["Total Verifications", summary.totalVerifications],
        ["Flagged Reviews", summary.flaggedReviews],
        ["Approved Reviews", summary.approvedReviews],
      ];
      for (const [name, m] of kpis) {
        rows.push(`${name},${m.value},${m.trend},${m.positive ? "Up" : "Down"}`);
      }
    }

    rows.push("", "=== BUSINESSES BY CATEGORY ===", "Category,Count,Percentage");
    for (const c of categories) {
      rows.push(`${c.name},${c.count},${c.percentage}%`);
    }

    rows.push("", "=== DAILY REGISTRATIONS ===", "Date,Label,Count");
    for (const r of registrations) {
      rows.push(`${r.date},${r.label},${r.count}`);
    }

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `saloneonline-analytics-${dateRange.from}-${dateRange.to}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setMsg({ text: "Report exported successfully.", ok: true });
  } catch {
    setMsg({ text: "Export failed. Please try again.", ok: false });
  } finally {
    setExporting(false);
    setTimeout(() => setMsg(null), 4000);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const defaultRange: DateRange = { from: daysAgoStr(6), to: todayStr() };

  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const fetchAll = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(false);

    const qs = `startDate=${range.from}&endDate=${range.to}`;

    try {
      const [sumRes, catRes, regRes] = await Promise.all([
        fetch(`/api/admin/analytics/reports/summary?${qs}`),
        fetch(`/api/admin/analytics/reports/categories?${qs}`),
        fetch(`/api/admin/analytics/reports/registrations?${qs}`),
      ]);

      if (!sumRes.ok || !catRes.ok || !regRes.ok) throw new Error("API error");

      const [sumJson, catJson, regJson] = await Promise.all([
        sumRes.json() as Promise<{ data: AnalyticsSummary }>,
        catRes.json() as Promise<{ data: { categories: Category[]; total: number } }>,
        regRes.json() as Promise<{ data: { registrations: Registration[] } }>,
      ]);

      setSummary(sumJson.data);
      setCategories(catJson.data.categories);
      setCategoryTotal(catJson.data.total);
      setRegistrations(regJson.data.registrations);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll(dateRange);
  }, [dateRange, fetchAll]);

  const handleExport = useCallback(() => {
    void runExport(dateRange, summary, categories, registrations, setExporting, setExportMsg);
  }, [dateRange, summary, categories, registrations]);

  const kpiCards = useMemo(
    () =>
      KPI_CONFIG.map((cfg) => ({
        config: cfg,
        metric: summary?.[cfg.key],
      })),
    [summary],
  );

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Reports Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your AI Web Business Directory performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <IcoDownload className="size-4" />
            {exporting ? "Exporting…" : "Export Report"}
          </button>
        </div>
      </div>

      {/* ── Export notification ─────────────────────────────────────────────── */}
      {exportMsg && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            exportMsg.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="text-sm font-semibold">{exportMsg.text}</span>
          <button
            type="button"
            onClick={() => setExportMsg(null)}
            className="text-current opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && <ErrorBanner onRetry={() => void fetchAll(dateRange)} />}

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map(({ config, metric }) => (
          <KPICard
            key={config.key}
            config={config}
            metric={metric}
            loading={loading}
          />
        ))}
      </section>

      {/* ── Charts ───────────────────────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-2">
        <CategoryChart
          data={categories}
          total={categoryTotal}
          loading={loading}
        />
        <RegistrationChart data={registrations} loading={loading} />
      </section>
    </div>
  );
}
