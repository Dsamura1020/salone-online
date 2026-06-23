import type { ReactNode } from "react";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { UserHeader } from "./user-header";
import { UserSidebar } from "./user-sidebar";

type UserDashboardShellProps = {
  user: DashboardUser;
  activeView: string;
  notificationCount: number;
  reviewBusinessName?: string;
  children: ReactNode;
};

export function UserDashboardShell({
  user,
  activeView,
  notificationCount,
  reviewBusinessName,
  children,
}: UserDashboardShellProps) {
  const sidebarActiveView =
    activeView === "review" || activeView === "view" ? "saved" : activeView;

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950">
      <div className="flex min-h-screen">
        <UserSidebar user={user} activeView={sidebarActiveView} />
        <main className="min-w-0 flex-1">
          <UserHeader
            activeView={activeView}
            notificationCount={notificationCount}
            reviewBusinessName={reviewBusinessName}
          />
          <div className="px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
