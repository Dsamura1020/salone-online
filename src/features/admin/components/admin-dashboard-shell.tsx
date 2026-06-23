import type { ReactNode } from "react";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

type AdminDashboardShellProps = {
  user: DashboardUser;
  activeView: string;
  notificationCount: number;
  children: ReactNode;
};

export function AdminDashboardShell({
  user,
  activeView,
  notificationCount,
  children,
}: AdminDashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#eef2f8] text-slate-950">
      <AdminSidebar user={user} activeView={activeView} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          user={user}
          activeView={activeView}
          notificationCount={notificationCount}
        />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
