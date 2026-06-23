import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { BusinessDetailSummary } from "@/components/businesses/business-detail-summary";
import { BusinessReviewsSection } from "@/components/reviews/business-reviews-section";
import { getSession } from "@/lib/auth/auth";
import { publicBusinessWhere } from "@/lib/business/public-visibility";
import { prisma } from "@/lib/prisma/prisma";
import { listPublicBusinessReviews } from "@/services/review.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    mode?: string;
    readonly?: string;
    ownerPreview?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PublicBusinessPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await getSession();
  const reviewOnlyMode = query?.mode === "review";
  const detailsOnlyMode = query?.mode === "view" || query?.readonly === "1";
  const showReviewsSection = !detailsOnlyMode;
  const showReviewForm = !detailsOnlyMode;
  const ownerPreview = query?.ownerPreview === "1" && Boolean(session?.user?.id);

  const business = await prisma.business.findFirst({
    where: ownerPreview
      ? { slug, ownerId: session!.user.id }
      : { slug, ...publicBusinessWhere },
    include: {
      category: { select: { name: true } },
      location: {
        select: { city: true, stateProvince: true, country: true },
      },
    },
  });

  if (!business) {
    notFound();
  }

  if (session?.user?.id && session.user.id !== business.ownerId && !ownerPreview) {
    await prisma.businessView.upsert({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: business.id,
        },
      },
      update: { viewedAt: new Date() },
      create: {
        userId: session.user.id,
        businessId: business.id,
      },
    });
  }

  const reviews = await listPublicBusinessReviews(business.id);
  const mappedBusiness = {
    id: business.id,
    ownerId: business.ownerId,
    businessName: business.businessName,
    slug: business.slug,
    description: business.description,
    averageRating: Number(business.averageRating),
    reviewCount: business.reviewCount,
    ratingCount: 0,
    isVerified: business.isVerified,
    categoryName: business.category.name,
    city: business.location.city,
    stateProvince: business.location.stateProvince,
    country: business.location.country,
    imageUrl: business.coverImageUrl ?? business.logoUrl,
    phone: business.phone,
    email: business.email,
    website: business.website,
  };

  const reviewsAnchor = detailsOnlyMode
    ? `/businesses/${mappedBusiness.slug}?mode=review#reviews`
    : "#reviews";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/businesses"
          className="text-sm font-semibold text-[#111d63] hover:underline"
        >
          ← Registered Businesses
        </Link>

        {!reviewOnlyMode && (
          <div className="mt-6">
            <BusinessDetailSummary business={mappedBusiness} reviewsAnchor={reviewsAnchor} />
          </div>
        )}

        {showReviewsSection && (
          <BusinessReviewsSection
            businessId={mappedBusiness.id}
            businessSlug={mappedBusiness.slug}
            businessName={mappedBusiness.businessName}
            ownerId={mappedBusiness.ownerId}
            currentUserId={session?.user?.id ?? null}
            averageRating={mappedBusiness.averageRating}
            reviewCount={mappedBusiness.reviewCount}
            initialReviews={reviews.map((review) => ({
              ...review,
              createdAt: review.createdAt.toISOString(),
            }))}
            isLoggedIn={Boolean(session?.user?.id)}
            showReviewForm={showReviewForm}
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
