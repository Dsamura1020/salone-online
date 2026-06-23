import type { ReactNode } from "react";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  user: DashboardUser;
  activeView: string;
  children: ReactNode;
};

export function DashboardShell({
  user,
  activeView,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950">
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} activeView={activeView} />
        <main className="min-w-0 flex-1">
          <DashboardHeader role={user.role} activeView={activeView} />
          <div className="px-7 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
