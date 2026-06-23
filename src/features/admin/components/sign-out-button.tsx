"use client";

import { signOut } from "next-auth/react";

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
