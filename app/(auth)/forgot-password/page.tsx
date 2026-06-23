import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Password reset is not automated yet. Contact support or sign in if you
        remember your credentials.
      </p>
      <Link href="/login" className="mt-6 text-sm font-semibold text-[#111d63] hover:underline">
        Back to login
      </Link>
    </main>
  );
}
