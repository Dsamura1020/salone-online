import { getAdminDashboardData } from "@/lib/admin/dashboard-data";
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboardOverview data={data} />;
}
