import Link from "next/link";
import { Brand } from "./brand";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="inline-flex rounded-md px-4 py-2 text-sm font-bold text-slate-950 transition hover:text-[#111d63]"
          >
            Login
          </Link>
          <Link
            href="/login?mode=register-business&callbackUrl=/dashboard/owner/businesses/new"
            className="inline-flex min-h-9 items-center rounded-lg bg-[#111d63] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#27339a]"
          >
            Register Business
          </Link>
        </div>
      </div>
    </header>
  );
}
