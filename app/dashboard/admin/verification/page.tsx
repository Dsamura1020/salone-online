import { listVerificationRequests } from "@/services/verification.service";
import { VerificationQueue } from "@/features/verification/components/verification-queue";

export default async function AdminVerificationPage() {
  const { items } = await listVerificationRequests({
    page: 1,
    limit: 50,
  });

  const queueItems = items.map((item) => ({
    id: item.id,
    status: item.status,
    business: {
      businessName: item.business.businessName,
      categoryName: item.business.category?.name ?? "Uncategorized",
      latestDocumentName: item.business.documents[0]?.fileName ?? "No document",
    },
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <VerificationQueue initialItems={queueItems} />
    </div>
  );
}
