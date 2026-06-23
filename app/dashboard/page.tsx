import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/auth/permissions";
import { dashboardUserFromSession } from "@/features/users/services/dashboard-data";

export default async function DashboardRootPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (isAdmin(session.user.roles)) {
    redirect("/dashboard/admin");
  }

  const user = dashboardUserFromSession(session);
  if (user.role === "owner") {
    redirect("/dashboard/owner");
  }

  redirect("/dashboard/user");
}
