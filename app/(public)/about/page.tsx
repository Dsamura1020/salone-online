import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-[#111d63] hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 text-4xl font-bold text-slate-900">About SaloneOnline</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">
        SaloneOnline helps people discover verified businesses across Sierra Leone.
        Owners can register listings, submit verification documents, and manage
        their presence from a dedicated dashboard.
      </p>
    </main>
  );
}
