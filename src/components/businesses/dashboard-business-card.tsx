"use client";

import type { RegisteredBusiness } from "@/lib/business/registered-business-types";
import { RegisteredBusinessCard } from "./registered-business-card";

type DashboardBusinessCardProps = {
  business: RegisteredBusiness;
  currentUserId?: string | null;
  initialRatingCount?: number;
  viewHref?: string;
  reviewHref?: string;
  canSaveBusiness?: boolean;
  initialIsSaved?: boolean;
};

export function DashboardBusinessCard({
  business,
  currentUserId,
  initialRatingCount = 0,
  viewHref,
  reviewHref,
  canSaveBusiness,
  initialIsSaved,
}: DashboardBusinessCardProps) {
  return (
    <RegisteredBusinessCard
      business={business}
      currentUserId={currentUserId}
      initialRatingCount={initialRatingCount}
      viewHref={viewHref}
      reviewHref={reviewHref}
      canSaveBusiness={canSaveBusiness}
      initialIsSaved={initialIsSaved}
    />
  );
}
