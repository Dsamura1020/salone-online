import { Suspense } from "react";
import Link from "next/link";
import { RegisteredBusinessesPaginatedGrid } from "@/features/users/components/registered-businesses-paginated-grid";
import { SearchPage } from "@/features/search/components/search-page";
import type {
  MemberDashboardData,
  MemberReviewBusiness,
} from "@/features/users/services/member-dashboard-data";
import { BusinessReviewsSection } from "@/components/reviews/business-reviews-section";
import { BusinessDetailSummary } from "@/components/businesses/business-detail-summary";
import {
  EmptyState,
  LinkAction,
  MemberActivityList,
  MetricCard,
  Panel,
  SavedBusinessCard,
} from "@/components/layouts/dashboard-cards";
import { BriefcaseIcon, EyeIcon, StarIcon } from "@/components/layouts/icons";
import { ChangePasswordCard } from "./change-password-card";
import { ProfileSettingsForm } from "./profile-settings-form";
import { MemberReviewsView } from "./member-reviews-view";

type MemberDashboardProps = {
  activeView: string;
  settingsTab?: string;
  currentUserId: string;
  data: MemberDashboardData;
  reviewBusiness?: MemberReviewBusiness | null;
  reviewBackHref?: string;
  viewBusiness?: MemberReviewBusiness | null;
  viewBackHref?: string;
};

export function MemberDashboard({
  activeView,
  settingsTab,
  currentUserId,
  data,
  reviewBusiness,
  reviewBackHref,
  viewBusiness,
  viewBackHref,
}: MemberDashboardProps) {
  if (activeView === "view" && viewBusiness) {
    return (
      <MemberViewBusinessView
        business={viewBusiness}
        backHref={viewBackHref ?? "/dashboard/user?view=saved"}
      />
    );
  }
  if (activeView === "review" && reviewBusiness) {
    return (
      <MemberWriteReviewView
        business={reviewBusiness}
        currentUserId={currentUserId}
        backHref={reviewBackHref ?? "/dashboard/user?view=saved"}
      />
    );
  }
  if (activeView === "saved" || activeView === "businesses") {
    return (
      <MemberBusinessesView
        activeView={activeView}
        data={data}
      />
    );
  }
  if (activeView === "settings") {
    return <MemberSettingsView data={data} tab={settingsTab} />;
  }
  if (activeView === "reviews") {
    return <MemberReviewsView reviews={data.reviews} />;
  }
  if (activeView === "verification") {
    return <MemberVerificationView />;
  }

  return (
    <MemberOverview data={data} currentUserId={currentUserId} />
  );
}

function MemberViewBusinessView({
  business,
  backHref,
}: {
  business: MemberReviewBusiness;
  backHref: string;
}) {
  const reviewHref = `/dashboard/user?view=review&business=${encodeURIComponent(business.slug)}&from=saved`;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex text-sm font-semibold text-[#111d63] hover:underline"
      >
        ← Back to Saved
      </Link>

      <BusinessDetailSummary business={business} reviewsAnchor={reviewHref} />
    </div>
  );
}

function RegisteredBusinessCardGrid({
  businesses,
  currentUserId,
  savedBusinessIds,
  canSaveBusiness = true,
}: {
  businesses: MemberDashboardData["registeredBusinesses"];
  currentUserId: string;
  savedBusinessIds: string[];
  canSaveBusiness?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <DashboardBusinessGridSkeleton />
      }
    >
      <RegisteredBusinessesPaginatedGrid
        businesses={businesses}
        currentUserId={currentUserId}
        savedBusinessIds={savedBusinessIds}
        canSaveBusiness={canSaveBusiness}
      />
    </Suspense>
  );
}

function MemberOverview({
  data,
  currentUserId,
}: {
  data: MemberDashboardData;
  currentUserId: string;
}) {
  const { stats, registeredBusinesses, savedBusinessIds, activity } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Saved Businesses"
          value={String(stats.myBusinessesCount).padStart(2, "0")}
          detail={
            stats.myBusinessesCount > 0
              ? `${stats.verifiedCount} verified, ${stats.pendingCount} pending`
              : "No saved businesses yet"
          }
          icon={BriefcaseIcon}
          tone="navy"
        />
        <MetricCard
          label="Total Reviews"
          value={String(stats.totalReviews).padStart(2, "0")}
          detail={
            stats.averageRatingLabel !== "—"
              ? `Average rating ${stats.averageRatingLabel}`
              : "No reviews submitted yet"
          }
          icon={StarIcon}
          tone="soft"
        />
        <MetricCard
          label="Profile Views"
          value={stats.profileViewsLabel}
          detail="Across your tracked listings"
          icon={EyeIcon}
          tone="orange"
        />
      </div>

      <Panel
        title="All Businesses"
        subtitle="All registered businesses on the platform"
        action={
          <LinkAction href="/dashboard/user?view=businesses" label="View directory" />
        }
      >
        <RegisteredBusinessCardGrid
          businesses={registeredBusinesses}
          currentUserId={currentUserId}
          savedBusinessIds={savedBusinessIds}
        />
      </Panel>

      {activity.length > 0 ? (
        <MemberActivityList items={activity} />
      ) : (
        <Panel title="Recent Activity" subtitle="Latest platform updates">
          <p className="text-sm font-medium text-slate-500">
            Your reviews, ratings, and account events will appear here.
          </p>
        </Panel>
      )}
    </div>
  );
}

function MemberBusinessesView({
  activeView,
  data,
}: {
  activeView: string;
  data: MemberDashboardData;
}) {
  if (activeView === "saved") {
    return (
      <Panel
        title="Saved Businesses"
        subtitle="Businesses you saved for quick access"
      >
        {data.savedBusinesses.length === 0 ? (
          <EmptyState title="No saved businesses yet">
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Save businesses from the directory to keep them here.
            </p>
            <Link
              href="/dashboard/user?view=businesses"
              className="mt-4 inline-flex rounded-lg bg-[#10206f] px-4 py-2.5 text-xs font-extrabold text-white"
            >
              See all businesses
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.savedBusinesses.map((business) => (
              <SavedBusinessCard
                key={business.id}
                business={business}
                detailsHref={`/dashboard/user?view=view&business=${encodeURIComponent(business.slug)}&from=saved`}
                reviewHref={`/dashboard/user?view=review&business=${encodeURIComponent(business.slug)}&from=saved`}
              />
            ))}
          </div>
        )}
      </Panel>
    );
  }

  return (
    <Suspense
      fallback={
        <DashboardSearchSkeleton />
      }
    >
      <SearchPage
        basePath="/dashboard/user?view=businesses"
        backHref="/dashboard/user"
        embedded
        showHeroSearch={false}
        showCompactSearch
        savedBusinessIds={data.savedBusinessIds}
        resultLinksMode="dashboard"
        allowSaveBusiness
      />
    </Suspense>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

function DashboardBusinessGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <SkeletonBlock className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="flex gap-2 pt-4">
              <SkeletonBlock className="h-12 flex-1" />
              <SkeletonBlock className="h-12 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSearchSkeleton() {
  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mt-6 h-11 w-full" />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-7 w-56" />
          </div>
          <SkeletonBlock className="h-11 w-full max-w-sm" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <SkeletonBlock className="size-14" />
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-52" />
                <SkeletonBlock className="h-4 w-72 max-w-full" />
                <SkeletonBlock className="h-4 w-44" />
              </div>
              <div className="flex gap-2 sm:w-32 sm:flex-col">
                <SkeletonBlock className="size-9 sm:self-end" />
                <SkeletonBlock className="h-9 w-full" />
                <SkeletonBlock className="h-9 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function MemberVerificationView() {
  return (
    <Panel
      title="Business verification"
      subtitle="List your business on AI Business Directory"
    >
      <p className="text-sm font-medium leading-relaxed text-slate-600">
        Register as a business owner to submit your company for admin verification.
        Once approved, your listing appears in search and on your owner dashboard.
      </p>
      <Link
        href="/login?mode=register-business"
        className="mt-5 inline-flex rounded-lg bg-[#10206f] px-5 py-2.5 text-sm font-extrabold text-white"
      >
        Register your business
      </Link>
    </Panel>
  );
}

function MemberSettingsView({
  data,
  tab,
}: {
  data: MemberDashboardData;
  tab?: string;
}) {
  if (tab === "account") {
    return (
      <div className="max-w-lg">
        <ChangePasswordCard />
      </div>
    );
  }

  if (tab === "profile") {
    return <ProfileSettingsForm profile={data.profile} />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <ProfileSettingsForm profile={data.profile} />
      <ChangePasswordCard />
    </div>
  );
}

function MemberWriteReviewView({
  business,
  currentUserId,
  backHref,
}: {
  business: MemberReviewBusiness;
  currentUserId: string;
  backHref: string;
}) {
  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex text-sm font-semibold text-[#111d63] hover:underline"
      >
        ← Back to Saved
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BusinessReviewsSection
          businessId={business.id}
          businessSlug={business.slug}
          businessName={business.businessName}
          ownerId={business.ownerId}
          currentUserId={currentUserId}
          isLoggedIn
          averageRating={business.averageRating}
          reviewCount={business.reviewCount}
          initialReviews={business.reviews}
        />
      </div>
    </div>
  );
}
