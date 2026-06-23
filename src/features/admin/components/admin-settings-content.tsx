"use client";

import Link from "next/link";
import type { MemberProfile } from "@/features/users/services/member-dashboard-data";
import { ProfileSettingsForm } from "@/features/users/components/profile-settings-form";
import { ChangePasswordCard } from "@/features/users/components/change-password-card";

type AdminSettingsContentProps = {
  profile: MemberProfile;
  activeTab: string;
};

export function AdminSettingsContent({
  profile,
  activeTab,
}: AdminSettingsContentProps) {
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account & Password" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/dashboard/admin/settings?tab=${tab.id}`}
            className={`px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id
                ? "border-b-2 border-[#10206f] text-[#10206f]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "account" ? (
        <div className="max-w-lg">
          <ChangePasswordCard />
        </div>
      ) : (
        <ProfileSettingsForm profile={profile} />
      )}
    </div>
  );
}
