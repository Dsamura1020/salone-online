"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { DashboardRole, DashboardUser } from "@/features/users/services/dashboard-data";
import {
  dashboardRoleLabel,
  dashboardSubtitle,
  dashboardTitle,
} from "./dashboard-sidebar-helpers";
import { DashboardLogoutButton } from "./dashboard-logout-button";
import {
  BuildingIcon,
  GridIcon,
  MessageIcon,
  SettingsIcon,
  ShieldIcon,
} from "./icons";

type DashboardSidebarProps = {
  user: DashboardUser;
  activeView: string;
};

const MY_BUSINESS_VIEWS = ["businesses", "verification"];
const ENGAGEMENT_VIEWS = ["reviews"];

export function DashboardSidebar({ user, activeView }: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const [myBusinessOpen, setMyBusinessOpen] = useState(true);
  const [engagementOpen, setEngagementOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(activeView === "settings");

  useEffect(() => {
    if (MY_BUSINESS_VIEWS.includes(activeView)) {
      setMyBusinessOpen(true);
    }
    if (ENGAGEMENT_VIEWS.includes(activeView)) {
      setEngagementOpen(true);
    }
    if (activeView === "settings") {
      setSettingsOpen(true);
    }
  }, [activeView]);

  function isSettingsTabActive(tab: string) {
    if (tab === "profile") {
      return activeView === "settings" && (activeTab === "profile" || activeTab === null);
    }
    return activeView === "settings" && activeTab === tab;
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col bg-[#0b1020] text-slate-300">
      {/* Brand */}
      <div className="shrink-0 flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black text-white">
          SO
        </span>
        <span className="text-lg font-bold text-white">SaloneOnline</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {/* ── Main ──────────────────────────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main
          </p>
          <div className="space-y-1">
            <Link
              href="/dashboard/owner?view=overview"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activeView === "overview"
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <GridIcon className="size-[18px]" />
              Dashboard
            </Link>
          </div>
        </div>

        {/* ── My Business — collapsible ──────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            My Business
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMyBusinessOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                MY_BUSINESS_VIEWS.includes(activeView)
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <BuildingIcon className="size-[18px]" />
                My Business
              </span>
              <span className="text-[10px]">{myBusinessOpen ? "▲" : "▼"}</span>
            </button>

            {myBusinessOpen && (
              <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                <Link
                  href="/dashboard/owner?view=businesses"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "businesses"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BuildingIcon className="size-4" />
                  My Businesses
                </Link>
                <Link
                  href="/dashboard/owner?view=verification"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "verification"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ShieldIcon className="size-4" />
                  Verification
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Engagement — collapsible ───────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Engagement
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setEngagementOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                ENGAGEMENT_VIEWS.includes(activeView)
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageIcon className="size-[18px]" />
                Engagement
              </span>
              <span className="text-[10px]">{engagementOpen ? "▲" : "▼"}</span>
            </button>

            {engagementOpen && (
              <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                <Link
                  href="/dashboard/owner?view=reviews"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "reviews"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <MessageIcon className="size-4" />
                  Reviews
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Settings — collapsible ─────────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Settings
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activeView === "settings"
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <SettingsIcon className="size-[18px]" />
                Settings
              </span>
              <span className="text-[10px]">{settingsOpen ? "▲" : "▼"}</span>
            </button>

            {settingsOpen && (
              <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                <Link
                  href="/dashboard/owner?view=settings&tab=profile"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isSettingsTabActive("profile")
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ShieldIcon className="size-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/owner?view=settings&tab=account"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isSettingsTabActive("account")
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <SettingsIcon className="size-4" />
                  Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f49a52] text-sm font-extrabold text-slate-950">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.accountRoleLabel}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
          <span className="text-sm font-semibold text-slate-300">Logout</span>
          <DashboardLogoutButton />
        </div>
      </div>
    </aside>
  );
}

export { dashboardTitle, dashboardSubtitle, dashboardRoleLabel };
