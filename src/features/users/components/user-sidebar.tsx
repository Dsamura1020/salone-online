"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { DashboardLogoutButton } from "@/components/layouts/dashboard-logout-button";
import {
  BookmarkIcon,
  BuildingIcon,
  GridIcon,
  MessageIcon,
  SettingsIcon,
  ShieldIcon,
} from "@/components/layouts/icons";

type UserSidebarProps = {
  user: DashboardUser;
  activeView: string;
};

const BROWSE_VIEWS = ["businesses", "saved"];
const ACTIVITY_VIEWS = ["reviews"];

export function UserSidebar({ user, activeView }: UserSidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const [browseOpen, setBrowseOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(activeView === "settings");

  useEffect(() => {
    if (BROWSE_VIEWS.includes(activeView)) {
      setBrowseOpen(true);
    }
    if (ACTIVITY_VIEWS.includes(activeView)) {
      setActivityOpen(true);
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
              href="/dashboard/user?view=overview"
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

        {/* ── Browse — collapsible ───────────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Browse
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setBrowseOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                BROWSE_VIEWS.includes(activeView)
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <BuildingIcon className="size-[18px]" />
                Browse
              </span>
              <span className="text-[10px]">{browseOpen ? "▲" : "▼"}</span>
            </button>

            {browseOpen && (
              <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                <Link
                  href="/dashboard/user?view=businesses"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "businesses"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BuildingIcon className="size-4" />
                  All Businesses
                </Link>
                <Link
                  href="/dashboard/user?view=saved"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "saved"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BookmarkIcon className="size-4" />
                  Saved Businesses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Activity — collapsible ─────────────────────────────────────────── */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Activity
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActivityOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                ACTIVITY_VIEWS.includes(activeView)
                  ? "bg-[#1f2a44] text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageIcon className="size-[18px]" />
                Activity
              </span>
              <span className="text-[10px]">{activityOpen ? "▲" : "▼"}</span>
            </button>

            {activityOpen && (
              <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                <Link
                  href="/dashboard/user?view=reviews"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeView === "reviews"
                      ? "bg-[#1f2a44] text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <MessageIcon className="size-4" />
                  My Reviews
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
                  href="/dashboard/user?view=settings&tab=profile"
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
                  href="/dashboard/user?view=settings&tab=account"
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

export function userPageTitle(activeView: string, businessName?: string, tab?: string) {
  if (activeView === "view") {
    return businessName ? `Business: ${businessName}` : "Business";
  }
  if (activeView === "review") {
    return businessName ? `Review: ${businessName}` : "Write a Review";
  }
  if (activeView === "settings") {
    if (tab === "account") {
      return "Account & Password";
    }
    return "Profile Settings";
  }
  if (activeView === "businesses") {
    return "All Businesses";
  }
  if (activeView === "saved") {
    return "Saved Businesses";
  }
  if (activeView === "reviews") {
    return "My Reviews";
  }

  return "Dashboard";
}

export function userPageSubtitle(activeView: string, businessName?: string, tab?: string) {
  if (activeView === "view") {
    return businessName
      ? `Viewing details for ${businessName}`
      : "Viewing business details";
  }
  if (activeView === "review") {
    return businessName
      ? `Share your experience with ${businessName}`
      : "Share your experience with this business";
  }
  if (activeView === "overview") {
    return "Welcome back! Here's an overview of your activity.";
  }
  if (activeView === "businesses") {
    return "Browse all businesses available on the platform.";
  }
  if (activeView === "saved") {
    return "Businesses you have saved for later.";
  }
  if (activeView === "reviews") {
    return "Reviews you have submitted across the directory.";
  }
  if (activeView === "settings") {
    if (tab === "account") {
      return "Change your password and manage account security.";
    }
    return "Update your name, username, phone, and avatar.";
  }

  return "Your member dashboard on SaloneOnline.";
}
