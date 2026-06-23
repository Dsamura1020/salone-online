import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import {
  businessInitials,
  dashboardUserFromSession,
  initialsFromName,
  type BusinessSummary,
} from "@/features/users/services/dashboard-data";
import type { MemberProfile } from "@/features/users/services/member-dashboard-data";
import {
  getDisplayVerificationStatus,
  mapDisplayStatusToBadgeStatus,
} from "@/repositories/business.repository";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { OwnerDashboard } from "@/features/businesses/components/owner-dashboard";

type PageProps = {
  searchParams?: Promise<{ view?: string }>;
};

const ownerViews = new Set([
  "overview",
  "businesses",
  "reviews",
  "verification",
  "settings",
]);

export default async function OwnerDashboardPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  const user = dashboardUserFromSession(session);
  if (user.role !== "owner") {
    redirect("/dashboard/user");
  }

  const params = await searchParams;
  const activeView = normalizeView(params?.view);
  const [businesses, profile] = await Promise.all([
    getOwnerBusinesses(session.user.id),
    getOwnerProfile(session.user.id),
  ]);
  const dashboardUser = {
    ...user,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email,
    initials: initialsFromName(`${profile.firstName} ${profile.lastName}`),
    imageUrl: profile.image,
  };

  return (
    <DashboardShell user={dashboardUser} activeView={activeView}>
      <OwnerDashboard
        profile={profile}
        businesses={businesses}
        activeView={activeView}
      />
    </DashboardShell>
  );
}

async function getOwnerProfile(userId: string): Promise<MemberProfile> {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      timezone: true,
      locale: true,
      image: true,
    },
  });
}

function normalizeView(view: string | undefined) {
  const candidate = view ?? "overview";
  return ownerViews.has(candidate) ? candidate : "overview";
}

async function getOwnerBusinesses(userId: string): Promise<BusinessSummary[]> {
  const businesses = await prisma.business.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      slug: true,
      businessName: true,
      description: true,
      verificationStatus: true,
      isVerified: true,
      averageRating: true,
      reviewCount: true,
      logoUrl: true,
      coverImageUrl: true,
      _count: { select: { views: true } },
      category: { select: { name: true } },
      location: { select: { city: true, stateProvince: true } },
      verificationRequests: {
        select: { id: true },
        take: 1,
        orderBy: { submittedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return businesses.map((business) => {
    const rating = Number(business.averageRating || 0);

    const displayStatus = getDisplayVerificationStatus(
      business.verificationStatus,
      business.verificationRequests.length > 0,
    );

    return {
      id: business.id,
      slug: business.slug,
      imageUrl: business.logoUrl ?? business.coverImageUrl ?? undefined,
      name: business.businessName,
      initials: businessInitials(business.businessName),
      category: business.category.name,
      location:
        business.location.city ||
        business.location.stateProvince ||
        "Sierra Leone",
      status: mapDisplayStatusToBadgeStatus(displayStatus),
      views: business._count.views.toLocaleString(),
      leads: "0",
      rating: rating > 0 ? rating.toFixed(1) : "—",
      reviewCount: String(business.reviewCount || 0),
      description:
        business.description ??
        "A verified local business ready to connect with customers across Sierra Leone.",
    };
  });
}
