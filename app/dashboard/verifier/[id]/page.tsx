import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VerifierDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/dashboard/admin/verification/${id}`);
}
