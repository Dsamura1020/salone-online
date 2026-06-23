"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type {
  ReportsDashboardData,
  TopBusiness,
} from "@/lib/admin/reports-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type DownloadFormat = "csv" | "xlsx" | "pdf" | "docx" | "pptx";
type ReportType =
  | "users"
  | "businesses"
  | "verifications"
  | "reviews"
  | "categories";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function triggerDownload(
  type: ReportType | "all",
  format: DownloadFormat,
  setLoading: (key: string, v: boolean) => void,
  setToast: (msg: string, ok: boolean) => void,
) {
  const key = `${type}-${format}`;
  setLoading(key, true);

  try {
    if (format === "pdf") {
      window.print();
      setLoading(key, false);
      setToast("Print dialog opened.", true);
      return;
    }

    const url = `/api/admin/reports?type=${type === "all" ? "businesses" : type}&format=${format}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const match = /filename="([^"]+)"/.exec(disposition);
    anchor.download =
      match?.[1] ??
      `saloneonline-${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
    setToast(`${type} report downloaded successfully.`, true);
  } catch {
    setToast("Download failed. Please try again.", false);
  } finally {
    setLoading(key, false);
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  ok,
  onClose,
}: {
  message: string;
  ok: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span className="text-sm font-semibold">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

function EmailModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    recipient: "",
    subject: "SaloneOnline Analytics Report",
    message: "Please find the requested analytics report attached.",
    attachments: [] as string[],
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const ATTACHMENT_OPTIONS: ReportType[] = [
    "users",
    "businesses",
    "verifications",
    "reviews",
    "categories",
  ];

  function toggleAttachment(val: string) {
    setForm((f) => ({
      ...f,
      attachments: f.attachments.includes(val)
        ? f.attachments.filter((a) => a !== val)
        : [...f.attachments, val],
    }));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/reports/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setStatus({ msg: body.error ?? "Failed to send.", ok: false });
      } else {
        setStatus({ msg: `Report emailed to ${form.recipient}.`, ok: true });
        setTimeout(onClose, 1500);
      }
    } catch {
      setStatus({ msg: "Network error. Please try again.", ok: false });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Email Report</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => void handleSend(e)}>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-700">
              Recipient Email *
            </span>
            <input
              type="email"
              required
              value={form.recipient}
              onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#10206f]"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-700">
              Subject *
            </span>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#10206f]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-700">
              Message
            </span>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#10206f]"
            />
          </label>

          <div>
            <p className="mb-2 text-xs font-bold text-slate-700">Include Reports</p>
            <div className="flex flex-wrap gap-2">
              {ATTACHMENT_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form.attachments.includes(opt)}
                    onChange={() => toggleAttachment(opt)}
                    className="accent-[#10206f]"
                  />
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {status && (
            <p
              className={`text-xs font-semibold ${status.ok ? "text-emerald-700" : "text-red-600"}`}
            >
              {status.msg}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-[#10206f] px-5 py-2 text-sm font-bold text-white hover:bg-[#172d92] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

type DateRange = { from: string; to: string };

function formatDisplay(from: string, to: string): string {
  const fmt = (s: string) =>
    new Date(s + "T12:00:00").toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

function ReportsDatePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useState(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  });

  const today = new Date().toISOString().slice(0, 10);

  const PRESETS = [
    {
      label: "Last 7 days",
      from: new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10),
      to: today,
    },
    {
      label: "Last 30 days",
      from: new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10),
      to: today,
    },
    {
      label: "Last 3 months",
      from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0, 10); })(),
      to: today,
    },
    {
      label: "Last 6 months",
      from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10); })(),
      to: today,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setDraft(value); setOpen((o) => !o); }}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        📅 {formatDisplay(value.from, value.to)} ▾
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Select
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange({ from: p.from, to: p.to });
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
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                max={today}
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#10206f]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              if (draft.from && draft.to && draft.from <= draft.to) {
                onChange(draft);
                setOpen(false);
              }
            }}
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

type KPIItem = { label: string; value: number; color: string };

function KPICard({
  title,
  items,
  accentColor,
}: {
  title: string;
  items: KPIItem[];
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p
        className="mb-4 flex items-center gap-2 text-sm font-extrabold"
        style={{ color: accentColor }}
      >
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-extrabold text-slate-950">
              {item.value.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs font-semibold" style={{ color: item.color }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Download button ──────────────────────────────────────────────────────────

function DlBtn({
  format,
  reportType,
  loading,
  onDownload,
}: {
  format: DownloadFormat;
  reportType: ReportType;
  loading: boolean;
  onDownload: () => void;
}) {
  const COLORS: Record<DownloadFormat, string> = {
    pdf: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    docx: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    xlsx: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    pptx: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
    csv: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onDownload}
      className={`rounded-md border px-2 py-1 text-[10px] font-bold transition disabled:opacity-50 ${COLORS[format]}`}
    >
      {loading ? "…" : format.toUpperCase()}
    </button>
  );
}

// ─── Top Business row ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  APPROVED:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border border-amber-200 bg-amber-50 text-amber-700",
  REJECTED: "border border-red-200 bg-red-50 text-red-700",
  UNDER_REVIEW: "border border-indigo-200 bg-indigo-50 text-indigo-700",
};

function StarRatingDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`size-3.5 ${i < full ? "fill-current" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
        >
          <path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9L12 3Z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Insight item ─────────────────────────────────────────────────────────────

const INSIGHT_STYLES = {
  positive: { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-800" },
  warning: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-800" },
  info: { bg: "bg-indigo-50 border-indigo-200", dot: "bg-indigo-500", text: "text-indigo-800" },
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ReportsDashboard({ data }: { data: ReportsDashboardData }) {
  const router = useRouter();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [toast, setToastState] = useState<{
    msg: string;
    ok: boolean;
  } | null>(null);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [trendPeriod, setTrendPeriod] = useState<"Monthly" | "Quarterly" | "Yearly">(
    "Monthly",
  );

  // ── Date range state (initialised from server-resolved activeRange) ──────────
  const [dateRange, setDateRange] = useState<DateRange>({
    from: data.activeRange.from,
    to: data.activeRange.to,
  });

  // ── Local filter state (applied client-side to the top businesses table) ─────
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    verificationStatus: "",
    businessStatus: "",
  });
  const [topSearch, setTopSearch] = useState("");
  const [topSort, setTopSort] = useState<"rating" | "reviews">("rating");
  const [topPage, setTopPage] = useState(0);

  // Count active filters (excluding date range which is always set)
  const activeFilterCount = [
    filters.category,
    filters.location,
    filters.verificationStatus,
    filters.businessStatus,
  ].filter(Boolean).length;

  function applyDateFilter(range: DateRange) {
    router.push(
      `/dashboard/admin/analytics?tab=reports&from=${range.from}&to=${range.to}`,
    );
  }

  function applyAllFilters() {
    applyDateFilter(dateRange);
  }

  function resetFilters() {
    setFilters({ category: "", location: "", verificationStatus: "", businessStatus: "" });
    setTopSearch("");
    setTopPage(0);
    // Reset date range to default (last 6 months) and re-fetch
    router.push("/dashboard/admin/analytics?tab=reports");
  }

  const printRef = useRef<HTMLDivElement>(null);

  const setLoading = useCallback((key: string, val: boolean) => {
    setLoadingMap((m) => ({ ...m, [key]: val }));
  }, []);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToastState({ msg, ok });
    setTimeout(() => setToastState(null), 4000);
  }, []);

  const download = useCallback(
    (type: ReportType | "all", format: DownloadFormat) =>
      void triggerDownload(type, format, setLoading, showToast),
    [setLoading, showToast],
  );

  // ── Filtered top businesses ─────────────────────────────────────────────────
  const PAGE_SIZE = 5;
  const filteredBusinesses = useMemo(() => {
    let list = data.topBusinesses as TopBusiness[];
    if (filters.category) {
      list = list.filter((b) =>
        b.category.toLowerCase().includes(filters.category.toLowerCase()),
      );
    }
    if (filters.verificationStatus) {
      list = list.filter(
        (b) => b.verificationStatus === filters.verificationStatus,
      );
    }
    if (topSearch) {
      list = list.filter((b) =>
        b.name.toLowerCase().includes(topSearch.toLowerCase()),
      );
    }
    if (topSort === "reviews") {
      list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [data.topBusinesses, filters, topSearch, topSort]);

  const pagedBusinesses = filteredBusinesses.slice(
    topPage * PAGE_SIZE,
    topPage * PAGE_SIZE + PAGE_SIZE,
  );
  const totalPages = Math.ceil(filteredBusinesses.length / PAGE_SIZE);

  // ── Filtered growth data (period) ──────────────────────────────────────────
  const trendData = useMemo(() => {
    if (trendPeriod === "Quarterly") {
      const quarters: typeof data.growthTrend = [];
      for (let i = 0; i < data.growthTrend.length; i += 3) {
        const slice = data.growthTrend.slice(i, i + 3);
        if (slice.length === 0) continue;
        quarters.push({
          month: `Q${Math.floor(i / 3) + 1}`,
          newBusinesses: slice.reduce((s, p) => s + p.newBusinesses, 0),
          verifiedBusinesses: slice.reduce((s, p) => s + p.verifiedBusinesses, 0),
          userRegistrations: slice.reduce((s, p) => s + p.userRegistrations, 0),
        });
      }
      return quarters;
    }
    return data.growthTrend;
  }, [data.growthTrend, trendPeriod]);

  const HEADER_DOWNLOADS: DownloadFormat[] = ["pdf", "docx", "xlsx", "pptx"];
  const REPORT_TYPES: { type: ReportType; label: string; desc: string }[] = [
    { type: "users", label: "User Reports", desc: "User registrations, activity & engagement" },
    { type: "businesses", label: "Business Reports", desc: "Business listings, growth & status" },
    { type: "verifications", label: "Verification Reports", desc: "Verification status, approvals & insights" },
    { type: "reviews", label: "Review Reports", desc: "Review analytics, ratings & sentiment" },
    { type: "categories", label: "Category Reports", desc: "Category performance & trends" },
  ];

  const SYSTEM_REPORTS = [
    { label: "Daily Report", lastGen: "Today, 06:00 AM" },
    { label: "Weekly Report", lastGen: "Last Monday" },
    { label: "Monthly Report", lastGen: "1st of this month" },
    { label: "Quarterly Report", lastGen: "Start of quarter" },
    { label: "Annual Report", lastGen: "Jan 1, this year" },
  ];

  return (
    <div ref={printRef} className="space-y-6 print:space-y-4">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-none print:shadow-none">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View performance overview and download detailed reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {HEADER_DOWNLOADS.map((fmt) => {
            const ICON: Record<DownloadFormat, string> = {
              pdf: "📄",
              docx: "📝",
              xlsx: "📊",
              pptx: "📑",
              csv: "📋",
            };
            const LABEL: Record<DownloadFormat, string> = {
              pdf: "Download PDF",
              docx: "Download DOCX",
              xlsx: "Download Excel",
              pptx: "Download PPT",
              csv: "Download CSV",
            };
            return (
              <button
                key={fmt}
                type="button"
                disabled={!!loadingMap[`all-${fmt}`]}
                onClick={() => download("all", fmt)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <span>{ICON[fmt]}</span>
                {loadingMap[`all-${fmt}`] ? "…" : LABEL[fmt]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ✉ Email Report
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            🖨 Print Report
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm print:hidden">
        {/* Row 1 — Date range + action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-700">Filters</span>

          <ReportsDatePicker value={dateRange} onChange={setDateRange} />

          {/* Apply Filters — re-fetches server data with the selected date range */}
          <button
            type="button"
            onClick={applyAllFilters}
            className="flex items-center gap-1.5 rounded-xl bg-[#10206f] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#172d92]"
          >
            Apply Filters
          </button>

          {/* Reset — clears everything and returns to default 6-month view */}
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            ↺ Reset Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-700">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2 — Category / Location / Status dropdowns (filter the table in real-time) */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-400">Table filters:</span>

          <select
            value={filters.category}
            onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setTopPage(0); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-[#10206f]"
          >
            <option value="">All Categories</option>
            {data.allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) => { setFilters((f) => ({ ...f, location: e.target.value })); setTopPage(0); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-[#10206f]"
          >
            <option value="">All Locations</option>
            {data.allLocations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={filters.verificationStatus}
            onChange={(e) => { setFilters((f) => ({ ...f, verificationStatus: e.target.value })); setTopPage(0); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-[#10206f]"
          >
            <option value="">All Verification Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </select>

          <select
            value={filters.businessStatus}
            onChange={(e) => { setFilters((f) => ({ ...f, businessStatus: e.target.value })); setTopPage(0); }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-[#10206f]"
          >
            <option value="">All Business Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Users"
          accentColor="#3b82f6"
          items={[
            { label: "Total Users", value: data.kpi.users.total, color: "#3b82f6" },
            { label: "New This Month", value: data.kpi.users.newThisMonth, color: "#10b981" },
            { label: "Active Users", value: data.kpi.users.active, color: "#6366f1" },
            { label: "Inactive Users", value: data.kpi.users.inactive, color: "#ef4444" },
          ]}
        />
        <KPICard
          title="Businesses"
          accentColor="#10b981"
          items={[
            { label: "Total Businesses", value: data.kpi.businesses.total, color: "#10b981" },
            { label: "New This Month", value: data.kpi.businesses.newThisMonth, color: "#3b82f6" },
            { label: "Active Businesses", value: data.kpi.businesses.active, color: "#10b981" },
            { label: "Rejected", value: data.kpi.businesses.rejected, color: "#ef4444" },
          ]}
        />
        <KPICard
          title="Verifications"
          accentColor="#6366f1"
          items={[
            { label: "Pending", value: data.kpi.verifications.pending, color: "#f59e0b" },
            { label: "Approved", value: data.kpi.verifications.approved, color: "#10b981" },
            { label: "Rejected", value: data.kpi.verifications.rejected, color: "#ef4444" },
            { label: "Total Verifications", value: data.kpi.verifications.total, color: "#6366f1" },
          ]}
        />
        <KPICard
          title="Reviews"
          accentColor="#f59e0b"
          items={[
            { label: "Total Reviews", value: data.kpi.reviews.total, color: "#6366f1" },
            { label: "Approved", value: data.kpi.reviews.approved, color: "#10b981" },
            { label: "Pending", value: data.kpi.reviews.pending, color: "#f59e0b" },
            { label: "Flagged", value: data.kpi.reviews.flagged, color: "#ef4444" },
          ]}
        />
      </div>

      {/* ── Charts row 1 ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Business Growth Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-950">
              Business Growth Trend
            </h2>
            <div className="flex gap-1">
              {(["Monthly", "Quarterly", "Yearly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTrendPeriod(p)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    trendPeriod === p
                      ? "bg-[#10206f] text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="newBusinesses"
                stroke="#10206f"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="New Businesses"
              />
              <Line
                type="monotone"
                dataKey="verifiedBusinesses"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Verified Businesses"
              />
              <Line
                type="monotone"
                dataKey="userRegistrations"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="User Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Businesses by Category */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-950">
            Businesses by Category
          </h2>
          {data.categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="count"
                    nameKey="name"
                  >
                    {data.categoryBreakdown.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-slate-700 truncate max-w-[120px]">
                        {cat.name}
                      </span>
                    </span>
                    <span className="font-bold text-slate-950">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No category data yet.</p>
          )}
        </div>
      </div>

      {/* ── Charts row 2 ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Businesses by Location */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-950">
            Businesses by Location
          </h2>
          {data.locationBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={data.locationBreakdown}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#10206f" radius={[4, 4, 0, 0]} name="Businesses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No location data yet.</p>
          )}
        </div>

        {/* Verification Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-950">
            Verification Analytics
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data.verificationAnalytics}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {data.verificationAnalytics.map((entry, i) => (
                  <Cell key={`vc-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Reviews Analytics ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-slate-950">
          Reviews Analytics
        </h2>
        {data.reviewsAnalytics.every(
          (p) => p.approved + p.pending + p.flagged + p.rejected === 0,
        ) ? (
          <div className="flex h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-semibold text-slate-400">
              No review activity recorded yet
            </p>
            <p className="text-xs text-slate-400">
              Reviews will appear here once moderation begins
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data.reviewsAnalytics}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              <Bar
                dataKey="flagged"
                stackId="a"
                fill="#ef4444"
                name="Flagged"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Top Performing Businesses + AI Insights ───────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Top Businesses Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-slate-950">
              Top Performing Businesses
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search…"
                value={topSearch}
                onChange={(e) => {
                  setTopSearch(e.target.value);
                  setTopPage(0);
                }}
                className="h-8 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#10206f]"
              />
              <select
                value={topSort}
                onChange={(e) => setTopSort(e.target.value as "rating" | "reviews")}
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none"
              >
                <option value="rating">Sort: Rating</option>
                <option value="reviews">Sort: Reviews</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["#", "Business Name", "Category", "Rating", "Reviews", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-bold text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pagedBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                      No businesses found.
                    </td>
                  </tr>
                ) : (
                  pagedBusinesses.map((biz, idx) => (
                    <tr key={biz.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 text-xs font-bold text-slate-400">
                        {topPage * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">
                            {biz.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-semibold text-slate-950">{biz.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-slate-500">{biz.category}</td>
                      <td className="py-3">
                        <StarRatingDisplay rating={biz.rating} />
                      </td>
                      <td className="py-3 text-xs font-semibold text-slate-700">
                        {biz.reviewCount}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[biz.verificationStatus] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {biz.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/businesses/${biz.slug}`}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#10206f]"
                            title="View"
                          >
                            👁
                          </Link>
                          <button
                            type="button"
                            title="Download"
                            onClick={() => download("businesses", "csv")}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#10206f]"
                          >
                            ⬇
                          </button>
                          <Link
                            href={`/dashboard/admin/analytics`}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#10206f]"
                            title="Analytics"
                          >
                            📊
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                {topPage * PAGE_SIZE + 1}–
                {Math.min((topPage + 1) * PAGE_SIZE, filteredBusinesses.length)} of{" "}
                {filteredBusinesses.length}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={topPage === 0}
                  onClick={() => setTopPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 font-bold disabled:opacity-40"
                >
                  ‹
                </button>
                <button
                  type="button"
                  disabled={topPage >= totalPages - 1}
                  onClick={() => setTopPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 font-bold disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-950">
            <span className="text-indigo-500">✦</span> AI Business Insights
          </h2>
          <div className="space-y-3">
            {data.insights.map((insight) => {
              const style = INSIGHT_STYLES[insight.type];
              return (
                <div
                  key={insight.id}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 ${style.bg}`}
                >
                  <span className={`mt-0.5 size-2 shrink-0 rounded-full ${style.dot}`} />
                  <p className={`text-xs font-semibold leading-relaxed ${style.text}`}>
                    {insight.text}
                  </p>
                </div>
              );
            })}
            {data.insights.length === 0 && (
              <p className="text-xs text-slate-400">
                Insights will appear as data grows.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Download Detailed Reports ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-slate-950">
          Download Detailed Reports
        </h2>
        <div className="space-y-3">
          {REPORT_TYPES.map(({ type, label, desc }) => (
            <div
              key={type}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-lg">
                  📋
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {(["pdf", "docx", "xlsx", "pptx"] as DownloadFormat[]).map((fmt) => (
                  <DlBtn
                    key={fmt}
                    format={fmt}
                    reportType={type}
                    loading={!!loadingMap[`${type}-${fmt}`]}
                    onDownload={() => download(type, fmt)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Reports ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-slate-950">
          System Reports (Auto Generated)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SYSTEM_REPORTS.map(({ label, lastGen }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                  📅
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-950">{label}</p>
                  <p className="text-[10px] text-slate-400">Last: {lastGen}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(["pdf", "docx", "xlsx", "pptx"] as DownloadFormat[]).map((fmt) => (
                  <DlBtn
                    key={fmt}
                    format={fmt}
                    reportType="businesses"
                    loading={!!loadingMap[`sys-${label}-${fmt}`]}
                    onDownload={() =>
                      void triggerDownload("businesses", fmt, (k, v) => {
                        setLoadingMap((m) => ({
                          ...m,
                          [`sys-${label}-${k.split("-")[1]}`]: v,
                        }));
                      }, showToast)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Email Modal ───────────────────────────────────────────────────────── */}
      {showEmailModal && (
        <EmailModal onClose={() => setShowEmailModal(false)} />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.msg}
          ok={toast.ok}
          onClose={() => setToastState(null)}
        />
      )}
    </div>
  );
}
