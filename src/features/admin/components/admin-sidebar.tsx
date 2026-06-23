"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { DashboardLogoutButton } from "@/components/layouts/dashboard-logout-button";
import {
  BarChartIcon,
  BuildingIcon,
  FileIcon,
  GridIcon,
  LogoutIcon,
  MessageIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/layouts/icons";

type SidebarLink = {
  label: string;
  view: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  sub?: boolean;
};

type SidebarSection = {
  title: string;
  items: SidebarLink[];
};

// Only Dashboard in the static "Main" section — all other pages live in
// their respective collapsible groups below.
const adminSections: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", view: "overview", href: "/dashboard/admin", icon: GridIcon },
    ],
  },
];

const MANAGEMENT_VIEWS = ["users", "businesses", "verification", "reviews"];

type AdminSidebarProps = {
  user: DashboardUser;
  activeView: string;
};

export function AdminSidebar({ user, activeView }: AdminSidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  // Management starts open by default so the sidebar has enough content
  // to fill its height, eliminating the large empty gap above the footer.
  const [managementOpen, setManagementOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(activeView === "analytics");
  const [settingsOpen, setSettingsOpen] = useState(activeView === "settings");

  useEffect(() => {
    if (MANAGEMENT_VIEWS.includes(activeView)) {
      setManagementOpen(true);
    }
    if (activeView === "analytics") {
      setAnalyticsOpen(true);
    }
    if (activeView === "settings") {
      setSettingsOpen(true);
    }
  }, [activeView]);

  function isItemActive(item: SidebarLink) {
    if (item.view === "settings-profile") {
      return activeView === "settings" && (activeTab === "profile" || activeTab === null);
    }
    if (item.view === "settings-account") {
      return activeView === "settings" && activeTab === "account";
    }
    return activeView === item.view;
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col bg-[#0b1020] text-slate-300">
      {/* Brand — fixed at top */}
      <div className="shrink-0 flex items-center gap-3 border-b border-white/10 px-5 py-4">
        {user.accountRoleLabel?.includes("Super") ? (
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-sm font-black text-white">
            SA
          </span>
        ) : (
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black text-white">
            SO
          </span>
        )}
        <span className="text-lg font-bold text-white">SaloneOnline</span>
      </div>

      {/* Nav — flex-1 fills the remaining height between brand and footer,
           overflow-y-auto lets it scroll when fully expanded */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {/* ── Static sections (Main → Dashboard only) ───────────────────── */}
          {adminSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <Link
                      key={`${section.title}-${item.label}`}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-[#1f2a44] text-white shadow-inner"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="size-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Management group — collapsible ──────────────────────────────── */}
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Management
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setManagementOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  MANAGEMENT_VIEWS.includes(activeView)
                    ? "bg-[#1f2a44] text-white shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <UsersIcon className="size-[18px]" />
                  Management
                </span>
                <span className="text-[10px]">{managementOpen ? "▲" : "▼"}</span>
              </button>

              {managementOpen && (
                <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                  <Link
                    href="/dashboard/admin/users"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      activeView === "users"
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <UsersIcon className="size-4" />
                    Users
                  </Link>
                  <Link
                    href="/dashboard/admin/businesses"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      activeView === "businesses"
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <BuildingIcon className="size-4" />
                    Businesses
                  </Link>
                  <Link
                    href="/dashboard/admin/verification"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      activeView === "verification"
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <ShieldIcon className="size-4" />
                    Verification
                  </Link>
                  <Link
                    href="/dashboard/admin/reviews"
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

          {/* ── Analytics group — collapsible ───────────────────────────────── */}
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Analytics
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAnalyticsOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  activeView === "analytics"
                    ? "bg-[#1f2a44] text-white shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <BarChartIcon className="size-[18px]" />
                  Analytics
                </span>
                <span className="text-[10px]">{analyticsOpen ? "▲" : "▼"}</span>
              </button>

              {analyticsOpen && (
                <div className="ml-2 space-y-1 border-l border-white/10 pl-2">
                  <Link
                    href="/dashboard/admin/analytics"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      activeView === "analytics" &&
                      (activeTab === "analysis" || activeTab === null)
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <BarChartIcon className="size-4" />
                    Analysis
                  </Link>
                  <Link
                    href="/dashboard/admin/analytics?tab=reports"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      activeView === "analytics" && activeTab === "reports"
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <FileIcon className="size-4" />
                    Reports
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Settings group — collapsible ────────────────────────────────── */}
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
                    href="/dashboard/admin/settings?tab=profile"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isItemActive({
                        view: "settings-profile",
                        label: "Profile",
                        href: "/dashboard/admin/settings?tab=profile",
                        icon: UsersIcon,
                        sub: true,
                      })
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <UsersIcon className="size-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/admin/settings?tab=account"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isItemActive({
                        view: "settings-account",
                        label: "Account",
                        href: "/dashboard/admin/settings?tab=account",
                        icon: ShieldIcon,
                        sub: true,
                      })
                        ? "bg-[#1f2a44] text-white shadow-inner"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <ShieldIcon className="size-4" />
                    Account
                  </Link>
                </div>
              )}
            </div>
          </div>
      </nav>

      {/* ── System Admin / Logout — shrink-0 so it is always visible at the bottom ── */}
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

export function adminPageTitle(activeView: string) {
  switch (activeView) {
    case "users":
      return "Users";
    case "businesses":
      return "Businesses";
    case "analytics":
      return "Analytics";
    case "settings":
      return "Settings";
    case "verification":
      return "Verification";
    case "reviews":
      return "Review Moderation";
    default:
      return "Admin Dashboard";
  }
}

export function adminPageSubtitle(activeView: string) {
  switch (activeView) {
    case "users":
      return "Manage platform users, roles, and account access.";
    case "businesses":
      return "Browse and monitor all registered businesses on the platform.";
    case "analytics":
      return "Track growth, verification throughput, and review activity.";
    case "settings":
      return "Configure admin preferences and platform controls.";
    case "verification":
      return "Review submitted businesses and approve or reject listings.";
    case "reviews":
      return "Moderate flagged and pending reviews across the platform.";
    default:
      return "Manage users, businesses, reviews, and platform verification.";
  }
}

export { LogoutIcon };
