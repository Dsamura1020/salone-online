import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-600">
        Complete registration on the login page. After sign-up you will receive a
        six-digit code by email.
      </p>
      <Link href="/login" className="mt-6 text-sm font-semibold text-[#111d63] hover:underline">
        Go to login
      </Link>
    </main>
  );
}
