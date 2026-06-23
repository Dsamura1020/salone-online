export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return children;
}
