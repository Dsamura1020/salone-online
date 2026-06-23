import { getReportsDashboardData } from "@/lib/admin/reports-data";
import { ReportsDashboard } from "@/features/admin/components/reports-dashboard";
import { AnalyticsDashboard } from "@/features/admin/components/analytics-dashboard";

type PageProps = {
  searchParams?: Promise<{ tab?: string; from?: string; to?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = params?.tab ?? "analysis";

  if (tab === "reports") {
    const fromDate = params?.from ? new Date(params.from) : undefined;
    const toDate = params?.to ? new Date(params.to) : undefined;

    const reportData = await getReportsDashboardData(
      fromDate || toDate ? { from: fromDate, to: toDate } : undefined,
    );
    return <ReportsDashboard data={reportData} />;
  }

  // Default "Analysis" tab — new interactive Reports Dashboard
  return <AnalyticsDashboard />;
}
