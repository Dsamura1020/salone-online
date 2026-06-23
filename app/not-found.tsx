import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <Link href="/" className="mt-6 text-sm font-semibold text-[#111d63] hover:underline">
        Go home
      </Link>
    </main>
  );
}
