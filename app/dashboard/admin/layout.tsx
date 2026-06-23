export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/permissions";
import { dashboardUserFromSession } from "@/features/users/services/dashboard-data";
import { DashboardLayoutFrame } from "@/components/layouts/dashboard-layout-frame";
import { getAdminNotificationCount } from "@/lib/admin/dashboard-data";

export default async function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin");
  }

  if (!isAdmin(session.user.roles)) {
    redirect("/");
  }

  const [user, notificationCount] = await Promise.all([
    Promise.resolve(dashboardUserFromSession(session)),
    getAdminNotificationCount(),
  ]);

  return (
    <DashboardLayoutFrame user={user} notificationCount={notificationCount}>
      {children}
    </DashboardLayoutFrame>
  );
}
