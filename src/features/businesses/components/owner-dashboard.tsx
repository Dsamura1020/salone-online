import type { BusinessSummary } from "@/features/users/services/dashboard-data";
import type { MemberProfile } from "@/features/users/services/member-dashboard-data";
import {
  ActivityList,
  LinkAction,
  MetricCard,
  OwnerBusinessCard,
  OwnerBusinessRows,
  Panel,
  StatusBadge,
  metricIconSet,
  EmptyState,
} from "@/components/layouts/dashboard-cards";
import { ChangePasswordCard } from "@/features/users/components/change-password-card";
import { ProfileSettingsForm } from "@/features/users/components/profile-settings-form";

const ownerActivity = [
  { text: "Your business verification was approved", tone: "green" as const },
  { text: "A new 5-star review was submitted", tone: "orange" as const },
  { text: "AI search impressions increased this week", tone: "navy" as const },
  { text: "Profile information updated", tone: "slate" as const },
  { text: "New lead from Lion Mountain Tours", tone: "green" as const },
];

type OwnerDashboardProps = {
  profile: MemberProfile;
  businesses: BusinessSummary[];
  activeView: string;
};

export function OwnerDashboard({
  profile,
  businesses,
  activeView,
}: OwnerDashboardProps) {
  if (activeView === "businesses") {
    return <OwnerBusinessesView businesses={businesses} />;
  }
  if (activeView === "settings") {
    return <OwnerSettingsView profile={profile} />;
  }
  if (activeView === "reviews") {
    return <OwnerReviewsView businesses={businesses} />;
  }
  if (activeView === "verification") {
    return <OwnerVerificationView businesses={businesses} />;
  }

  return <OwnerOverview businesses={businesses} />;
}

function OwnerOverview({ businesses }: { businesses: BusinessSummary[] }) {
  const icons = metricIconSet();
  const verifiedCount = businesses.filter(
    (business) => business.status === "verified",
  ).length;
  const pendingCount = businesses.filter(
    (business) =>
      business.status === "pending_review" || business.status === "incomplete",
  ).length;
  const reviews =
    businesses.reduce((sum, business) => sum + Number(business.reviewCount), 0);
  const totalViews = businesses.reduce(
    (sum, business) => sum + Number(business.views.replace(/,/g, "")),
    0,
  );
  const ratings = businesses
    .map((business) => Number(business.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Businesses"
          value={String(businesses.length).padStart(2, "0")}
          detail={`${verifiedCount} verified · ${pendingCount} pending`}
          icon={icons.building}
          tone="navy"
        />
        <MetricCard
          label="Reviews"
          value={String(reviews).padStart(2, "0")}
          detail={
            averageRating !== null
              ? `Average rating ${averageRating.toFixed(1)}`
              : "No ratings yet"
          }
          icon={icons.message}
          tone="soft"
        />
        <MetricCard
          label="Profile Views"
          value={totalViews.toLocaleString()}
          detail="Unique signed-in viewers"
          icon={icons.eye}
          tone="orange"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Panel
          title="My Businesses"
          subtitle="Track listing performance and status"
          action={<LinkAction href="/dashboard/owner?view=businesses" label="View all" />}
        >
          <OwnerBusinessRows businesses={businesses} />
        </Panel>
        <ActivityList items={ownerActivity} />
      </div>
    </div>
  );
}

function OwnerBusinessesView({
  businesses,
}: {
  businesses: BusinessSummary[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {businesses.map((business) => (
        <OwnerBusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}

function OwnerSettingsView({ profile }: { profile: MemberProfile }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <ProfileSettingsForm profile={profile} />
      <ChangePasswordCard />
    </div>
  );
}

function OwnerReviewsView({ businesses }: { businesses: BusinessSummary[] }) {
  const reviewedBusinesses = businesses.filter(
    (business) => Number(business.reviewCount) > 0,
  );

  if (reviewedBusinesses.length === 0) {
    return (
      <EmptyState title="No reviewed businesses yet">
        <p className="mt-2 text-sm font-medium text-slate-500">
          Businesses will appear here after customers submit reviews.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {reviewedBusinesses.map((business) => (
        <OwnerBusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}

function OwnerVerificationView({
  businesses,
}: {
  businesses: BusinessSummary[];
}) {
  return (
    <div className="space-y-6">
      <Panel
        title="Verification Center"
        subtitle="Track the approval status assigned by platform administrators."
        action={<LinkAction href="/dashboard/owner/businesses/new" label="Add business" />}
      >
        <div className="space-y-4">
          {businesses.map((business) => {
            return (
              <div
                key={business.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    {business.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {business.category} · {business.location}
                  </p>
                </div>
                <StatusBadge status={business.status} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
