import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { VerificationDecisionForm } from "@/features/verification/components/verification-decision-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVerificationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const request = await prisma.verificationRequest.findUnique({
    where: { id },
    include: {
      business: true,
      submittedBy: {
        select: { email: true, firstName: true, lastName: true },
      },
      decisions: {
        orderBy: { decidedAt: "desc" },
        include: {
          verifier: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <article className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">
        {request.business.businessName}
      </h2>
      <p className="mb-6 mt-2 text-sm text-slate-500">
        Submitted by {request.submittedBy.firstName} {request.submittedBy.lastName} (
        {request.submittedBy.email})
      </p>
      <VerificationDecisionForm verificationRequestId={request.id} />
      {request.decisions.length > 0 && (
        <ul className="mt-8 space-y-2 text-sm text-slate-600">
          {request.decisions.map((decision) => (
            <li key={decision.id}>
              {decision.decision} by {decision.verifier.email}
              {decision.comments ? ` — ${decision.comments}` : ""}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
