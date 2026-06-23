import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BusinessDetailSummary } from "@/components/businesses/business-detail-summary";
import { BusinessReviewsSection } from "@/components/reviews/business-reviews-section";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import {
  dashboardUserFromSession,
  initialsFromName,
} from "@/features/users/services/dashboard-data";
import { listPublicBusinessReviews } from "@/services/review.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OwnerBusinessViewPage({ params }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  const sessionUser = dashboardUserFromSession(session);
  if (sessionUser.role !== "owner") {
    redirect("/dashboard/user");
  }

  const { id } = await params;
  const [profile, business] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
    }),
    prisma.business.findFirst({
      where: { id, ownerId: session.user.id },
      include: {
        category: { select: { name: true } },
        location: {
          select: { city: true, stateProvince: true, country: true },
        },
      },
    }),
  ]);

  if (!profile || !business) {
    notFound();
  }

  const reviews = await listPublicBusinessReviews(business.id);
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const dashboardUser = {
    ...sessionUser,
    name,
    email: profile.email,
    initials: initialsFromName(name),
    imageUrl: profile.image,
  };

  const businessSummary = {
    businessName: business.businessName,
    slug: business.slug,
    description: business.description,
    averageRating: Number(business.averageRating),
    reviewCount: business.reviewCount,
    categoryName: business.category.name,
    city: business.location.city,
    stateProvince: business.location.stateProvince,
    country: business.location.country,
    phone: business.phone,
    email: business.email,
    website: business.website,
  };

  return (
    <DashboardShell user={dashboardUser} activeView="businesses">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/owner?view=businesses"
            className="text-sm font-semibold text-[#10206f] hover:underline"
          >
            Back to My Businesses
          </Link>
          <Link
            href={`/dashboard/owner/businesses/${business.id}/edit`}
            className="rounded-lg bg-[#10206f] px-4 py-2.5 text-sm font-bold text-white"
          >
            Edit business
          </Link>
        </div>

        {business.logoUrl && (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.logoUrl}
              alt={`${business.businessName} logo`}
              className="size-20 rounded-xl border border-slate-200 object-cover"
            />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Business logo
              </p>
              <p className="mt-1 text-lg font-extrabold text-slate-950">
                {business.businessName}
              </p>
            </div>
          </div>
        )}

        <BusinessDetailSummary
          business={businessSummary}
          reviewsAnchor="#owner-business-reviews"
        />

        <div id="owner-business-reviews" className="scroll-mt-24">
          <BusinessReviewsSection
            businessId={business.id}
            businessSlug={business.slug}
            businessName={business.businessName}
            ownerId={business.ownerId}
            currentUserId={session.user.id}
            averageRating={Number(business.averageRating)}
            reviewCount={business.reviewCount}
            initialReviews={reviews.map((review) => ({
              ...review,
              createdAt: review.createdAt.toISOString(),
            }))}
            isLoggedIn
            showReviewForm={false}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
