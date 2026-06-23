import { Suspense } from "react";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef3fa]" aria-hidden="true" />}>
      <AuthPageShell />
    </Suspense>
  );
}
