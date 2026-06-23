"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { DashboardUser } from "@/features/users/services/dashboard-data";
import { AdminDashboardShell } from "@/features/admin/components/admin-dashboard-shell";
import { UserDashboardShell } from "@/features/users/components/user-dashboard-shell";
import { DashboardShell } from "./dashboard-shell";

type DashboardLayoutFrameProps = {
  user: DashboardUser;
  activeView?: string;
  notificationCount?: number;
  children: ReactNode;
};

export function adminActiveViewFromPath(pathname: string) {
  if (pathname.startsWith("/dashboard/admin/users")) {
    return "users";
  }
  if (pathname.startsWith("/dashboard/admin/businesses")) {
    return "businesses";
  }
  if (pathname.startsWith("/dashboard/admin/analytics")) {
    return "analytics";
  }
  if (pathname.startsWith("/dashboard/admin/settings")) {
    return "settings";
  }
  if (pathname.startsWith("/dashboard/admin/reviews")) {
    return "reviews";
  }
  if (pathname.startsWith("/dashboard/admin/verification")) {
    return "verification";
  }

  return "overview";
}

export function DashboardLayoutFrame({
  user,
  activeView,
  notificationCount = 0,
  children,
}: DashboardLayoutFrameProps) {
  const pathname = usePathname();
  const resolvedActiveView =
    user.role === "admin"
      ? adminActiveViewFromPath(pathname)
      : (activeView ?? "overview");

  if (user.role === "admin") {
    return (
      <AdminDashboardShell
        user={user}
        activeView={resolvedActiveView}
        notificationCount={notificationCount}
      >
        {children}
      </AdminDashboardShell>
    );
  }

  if (user.role === "user") {
    return (
      <UserDashboardShell
        user={user}
        activeView={resolvedActiveView}
        notificationCount={notificationCount}
      >
        {children}
      </UserDashboardShell>
    );
  }

  return (
    <DashboardShell user={user} activeView={resolvedActiveView}>
      {children}
    </DashboardShell>
  );
}
