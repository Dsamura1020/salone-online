import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/prisma";
import { AdminSettingsContent } from "@/features/admin/components/admin-settings-content";

type PageProps = {
  searchParams?: Promise<{ tab?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = params?.tab ?? "profile";

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      timezone: true,
      locale: true,
      image: true,
    },
  });

  return <AdminSettingsContent profile={user} activeTab={tab} />;
}
