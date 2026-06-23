"use client";

import { useState } from "react";
import { FileIcon } from "@/components/layouts/icons";

type ExportType = "businesses" | "users" | "reviews";

const EXPORT_OPTIONS: { value: ExportType; label: string }[] = [
  { value: "businesses", label: "Businesses" },
  { value: "users", label: "Users" },
  { value: "reviews", label: "Reviews" },
];

export function ExportReportButton() {
  const [exportType, setExportType] = useState<ExportType>("businesses");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const url = `/api/admin/export?type=${exportType}&format=csv`;
      const response = await fetch(url);
      if (!response.ok) {
        return;
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      anchor.download = match?.[1] ?? `saloneonline-${exportType}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-xl overflow-hidden border border-[#1a2d7c] bg-[#10206f]">
      <select
        value={exportType}
        onChange={(event) => setExportType(event.target.value as ExportType)}
        className="h-full bg-transparent px-3 py-2.5 text-xs font-bold text-white outline-none cursor-pointer"
        aria-label="Select export type"
        disabled={loading}
      >
        {EXPORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#10206f] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="h-7 w-px bg-white/20" />
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleExport()}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172d92] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileIcon className="size-4" />
        {loading ? "Exporting…" : "Export Report"}
      </button>
    </div>
  );
}
