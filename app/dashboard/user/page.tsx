import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import {
  dashboardUserFromSession,
  initialsFromName,
} from "@/features/users/services/dashboard-data";
import {
  getMemberDashboardData,
  getMemberReviewBusiness,
} from "@/features/users/services/member-dashboard-data";
import { MemberDashboard } from "@/features/users/components/member-dashboard";
import { UserDashboardShell } from "@/features/users/components/user-dashboard-shell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    view?: string;
    tab?: string;
    business?: string;
    page?: string;
    from?: string;
  }>;
};

const userViews = new Set([
  "overview",
  "businesses",
  "saved",
  "reviews",
  "settings",
]);

function normalizeUserView(view: string | undefined) {
  const candidate = view ?? "overview";
  return userViews.has(candidate) ? candidate : "overview";
}

function buildReviewBackHref(from?: string, page?: string) {
  const params = new URLSearchParams();
  const returnView =
    from === "overview" || from === "saved" || from === "businesses"
      ? from
      : "saved";
  params.set("view", returnView);

  if (page && page !== "1") {
    params.set("page", page);
  }

  const query = params.toString();
  return query ? `/dashboard/user?${query}` : "/dashboard/user";
}

function buildSavedBackHref(from?: string, page?: string) {
  const params = new URLSearchParams();
  const returnView =
    from === "overview" || from === "saved" || from === "businesses"
      ? from
      : "saved";
  params.set("view", returnView);

  if (page && page !== "1") {
    params.set("page", page);
  }

  const query = params.toString();
  return query ? `/dashboard/user?${query}` : "/dashboard/user";
}

export default async function UserDashboardPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/user");
  }

  const user = dashboardUserFromSession(session);
  if (user.role === "owner") {
    redirect("/dashboard/owner");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  const params = await searchParams;
  const rawView = params?.view;
  const settingsTab = params?.tab ?? "profile";

  let activeView = normalizeUserView(rawView);
  let reviewBusiness = null;
  let viewBusiness = null;
  let reviewBackHref = "/dashboard/user?view=saved";
  let viewBackHref = "/dashboard/user?view=saved";

  if (rawView === "review") {
    const businessSlug = params?.business?.trim();
    if (!businessSlug) {
      redirect("/dashboard/user?view=saved");
    }

    reviewBusiness = await getMemberReviewBusiness(businessSlug);
    if (!reviewBusiness) {
      redirect("/dashboard/user?view=saved");
    }

    activeView = "review";
    reviewBackHref = buildReviewBackHref(params?.from, params?.page);
  }

  if (rawView === "view") {
    const businessSlug = params?.business?.trim();
    if (!businessSlug) {
      redirect("/dashboard/user?view=saved");
    }

    viewBusiness = await getMemberReviewBusiness(businessSlug);
    if (!viewBusiness) {
      redirect("/dashboard/user?view=saved");
    }

    activeView = "view";
    viewBackHref = buildSavedBackHref(params?.from, params?.page);
  }

  const dashboardData = await getMemberDashboardData(session.user.id);
  const dashboardUser = {
    ...user,
    name: `${dashboardData.profile.firstName} ${dashboardData.profile.lastName}`.trim(),
    email: dashboardData.profile.email,
    initials: initialsFromName(
      `${dashboardData.profile.firstName} ${dashboardData.profile.lastName}`,
    ),
    imageUrl: dashboardData.profile.image,
  };

  return (
    <UserDashboardShell
      user={dashboardUser}
      activeView={activeView}
      notificationCount={dashboardData.notificationCount}
      reviewBusinessName={reviewBusiness?.businessName}
    >
      <MemberDashboard
        activeView={activeView}
        settingsTab={settingsTab}
        currentUserId={session.user.id}
        data={dashboardData}
        reviewBusiness={reviewBusiness}
        reviewBackHref={reviewBackHref}
        viewBusiness={viewBusiness}
        viewBackHref={viewBackHref}
      />
    </UserDashboardShell>
  );
}
