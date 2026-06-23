import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { BellIcon } from "@/components/layouts/icons";
import {
  adminPageSubtitle,
  adminPageTitle,
} from "./admin-sidebar";
import { ExportReportButton } from "./export-report-button";

type AdminHeaderProps = {
  user: DashboardUser;
  activeView: string;
  notificationCount: number;
};

function formatDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}, ${end.getFullYear()}`;
}

export function AdminHeader({
  user,
  activeView,
  notificationCount,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-[#f3f6fb] px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {adminPageTitle(activeView)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {adminPageSubtitle(activeView)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            {formatDateRange()}
          </div>

          <button
            type="button"
            className="relative inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
            aria-label={`Notifications (${notificationCount})`}
          >
            <BellIcon className="size-5" />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            ) : null}
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#f49a52] text-sm font-bold text-slate-950">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">{user.name}</p>
              <p className="text-xs text-slate-500">{user.accountRoleLabel}</p>
            </div>
          </div>

          <ExportReportButton />
        </div>
      </div>
    </header>
  );
}
