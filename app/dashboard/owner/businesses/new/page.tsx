import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { BusinessForm } from "@/components/forms/business-form";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { dashboardUserFromSession } from "@/features/users/services/dashboard-data";

export const dynamic = "force-dynamic";

export default async function NewBusinessPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner/businesses/new");
  }

  const user = dashboardUserFromSession(session);
  if (user.role !== "owner") {
    redirect("/dashboard/user");
  }

  const [categories, locations] = await Promise.all([
    prisma.businessCategory.findMany({
      select: {
        id: true,
        name: true,
        parentCategoryId: true,
        parentCategory: { select: { id: true, name: true } },
      },
      orderBy: [{ parentCategoryId: "asc" }, { name: "asc" }],
    }),
    prisma.location.findMany({
      select: {
        id: true,
        city: true,
        stateProvince: true,
        country: true,
      },
      orderBy: [{ stateProvince: "asc" }, { city: "asc" }],
      take: 500,
    }),
  ]);

  return (
    <DashboardShell user={user} activeView="businesses">
      <BusinessForm mode="create" categories={categories} locations={locations} />
    </DashboardShell>
  );
}
