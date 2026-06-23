import { listAllReviewsForModeration, listAllReports } from "@/services/review.service";
import { AdminReviewModeration } from "@/features/admin/components/admin-review-moderation";

export default async function AdminReviewsPage() {
  const [reviews, reports] = await Promise.all([
    listAllReviewsForModeration(100),
    listAllReports(),
  ]);

  return (
    <AdminReviewModeration
      initialReviews={reviews}
      initialReports={reports}
    />
  );
}
