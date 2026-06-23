"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { LogoutIcon } from "./icons";

type DashboardLogoutButtonProps = {
  className?: string;
  label?: ReactNode;
};

export function DashboardLogoutButton({
  className,
  label,
}: DashboardLogoutButtonProps = {}) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className={
        className ??
        "inline-flex size-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#10206f]/30"
      }
      aria-label="Logout"
      title="Logout"
    >
      {label ?? <LogoutIcon className="size-5" />}
    </button>
  );
}
