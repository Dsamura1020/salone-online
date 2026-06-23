import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import {
  getBusinessForOwner,
  getDisplayVerificationStatus,
} from "@/services/business.service";
import { BusinessForm } from "@/components/forms/business-form";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { dashboardUserFromSession } from "@/features/users/services/dashboard-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBusinessPage({ params }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/owner");
  }

  const user = dashboardUserFromSession(session);
  if (user.role !== "owner") {
    redirect("/dashboard/user");
  }

  const { id } = await params;

  const [categories, locations, business] = await Promise.all([
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
    getBusinessForOwner(id, session.user.id),
  ]);

  if (!business) {
    notFound();
  }

  const displayStatus = getDisplayVerificationStatus(
    business.verificationStatus,
    business.verificationRequests.length > 0,
  );

  return (
    <DashboardShell user={user} activeView="businesses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {business.businessName}
            </h1>
            <p className="text-sm text-zinc-500">
              Verification status:{" "}
              <span className="font-medium">{displayStatus}</span>
            </p>
          </div>
          <Link
            href="/dashboard/owner"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>

        <BusinessForm
          mode="edit"
          categories={categories}
          locations={locations}
          initialBusiness={{
            id: business.id,
            businessName: business.businessName,
            categoryId: business.categoryId,
            locationId: business.locationId,
            description: business.description,
            email: business.email,
            phone: business.phone,
            website: business.website,
            logoUrl: business.logoUrl,
            verificationStatus: business.verificationStatus,
            hasVerificationRequest: business.verificationRequests.length > 0,
            documents: business.documents.map((document) => ({
              id: document.id,
              documentType: document.documentType,
              fileName: document.fileName,
              fileUrl: document.fileUrl,
              mimeType: document.mimeType,
              fileSize: document.fileSize.toString(),
              uploadedAt: document.uploadedAt.toISOString(),
            })),
          }}
        />

        {business.verificationRequests.length > 0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Verification timeline
            </h2>
            <ul className="space-y-2 text-sm text-zinc-600">
              {business.verificationRequests.map((request) => (
                <li key={request.id} className="rounded-md border border-zinc-200 p-3">
                  <p className="font-medium text-zinc-800">
                    {request.status} · Submitted{" "}
                    {request.submittedAt.toLocaleString()}
                  </p>
                  {request.reviewedAt && (
                    <p className="text-zinc-500">
                      Reviewed {request.reviewedAt.toLocaleString()}
                    </p>
                  )}
                  {request.decisions.map((decision) => (
                    <p key={decision.id} className="text-zinc-500">
                      {decision.decision} by {decision.verifier.email}
                      {decision.comments ? ` — ${decision.comments}` : ""}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
