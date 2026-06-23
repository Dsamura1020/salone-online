"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BellIcon, BuildingIcon } from "@/components/layouts/icons";
import { userPageSubtitle, userPageTitle } from "./user-sidebar";

type UserHeaderProps = {
  activeView: string;
  notificationCount: number;
  reviewBusinessName?: string;
};

export function UserHeader({
  activeView,
  notificationCount,
  reviewBusinessName,
}: UserHeaderProps) {
  const searchParams = useSearchParams();
  const settingsTab = searchParams.get("tab") ?? "profile";
  const showWelcome = activeView === "overview";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#10206f] text-white">
            <BuildingIcon className="size-5" />
          </span>
          <span className="text-sm font-extrabold text-slate-950">
            AI Business Directory
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationButton count={notificationCount} />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">
            {userPageTitle(activeView, reviewBusinessName, settingsTab)}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            {showWelcome
              ? userPageSubtitle(activeView, reviewBusinessName, settingsTab)
              : userPageSubtitle(activeView, reviewBusinessName, settingsTab)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <NotificationButton count={notificationCount} />
          </div>
          <Link
            href="/dashboard/user?view=businesses"
            className="inline-flex items-center rounded-lg bg-[#10206f] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#172d92]"
          >
            Explore
          </Link>
        </div>
      </div>
    </header>
  );
}

function NotificationButton({ count }: { count: number }) {
  return (
    <button
      type="button"
      className="relative inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
      aria-label={`Notifications (${count})`}
    >
      <BellIcon className="size-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#10206f] px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
