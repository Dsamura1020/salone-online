import Link from "next/link";
import type { DashboardRole } from "@/features/users/services/dashboard-data";
import {
  BellIcon,
  PlusIcon,
} from "./icons";
import {
  dashboardRoleLabel,
  dashboardSubtitle,
  dashboardTitle,
} from "./dashboard-sidebar-helpers";

type DashboardHeaderProps = {
  role: DashboardRole;
  activeView: string;
};

export function DashboardHeader({ role, activeView }: DashboardHeaderProps) {
  const actionLabel =
    role === "admin"
      ? "Verification"
      : role === "owner"
        ? "Add Business"
        : "Saved";
  const actionHref =
    role === "admin"
      ? "/dashboard/admin/verification"
      : role === "owner"
        ? "/dashboard/owner/businesses/new"
        : "/dashboard/user?view=saved";

  return (
    <header className="border-b border-slate-200 bg-white px-7 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">
              {dashboardTitle(role, activeView)}
            </h1>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-950">
              {dashboardRoleLabel(role)}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            {dashboardSubtitle(role, activeView)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-slate-50"
          >
            <BellIcon className="size-4" />
            Notifications
          </button>
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 rounded-lg bg-[#10206f] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#172d92]"
          >
            <PlusIcon className="size-4" />
            {actionLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
