import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma/prisma";

type PageProps = { params: Promise<{ id: string }> };

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "border-rose-200 bg-rose-50 text-rose-700",
  ADMIN: "border-indigo-200 bg-indigo-50 text-indigo-700",
  BUSINESS_OWNER: "border-amber-200 bg-amber-50 text-amber-700",
  USER: "border-slate-200 bg-slate-100 text-slate-600",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="w-44 shrink-0 text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm text-slate-950">{value}</span>
    </div>
  );
}

function fmt(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        select: {
          roleId: true,
          role: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) notFound();

  // Separate counts query to avoid _count typing issues
  const counts = await prisma.user.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          businesses: true,
          reviews: true,
          ratings: true,
        },
      },
    },
  });

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.username;
  const initials = (user.firstName?.[0] ?? user.username[0] ?? "?").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10206f] hover:underline"
      >
        ← Back to Users
      </Link>

      {/* Profile header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          {/* Avatar */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#10206f]/10 text-2xl font-extrabold text-[#10206f]">
            {initials}
          </div>

          {/* Name & role badges */}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-950">{fullName}</h1>
            <p className="mt-0.5 text-sm text-slate-500">@{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles.length > 0 ? (
                user.roles.map((r) => (
                  <span
                    key={r.roleId}
                    className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
                      ROLE_COLORS[r.role.name] ??
                      "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {r.role.name.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No roles assigned</span>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-block rounded-lg border px-3 py-1 text-xs font-bold ${
                user.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
            {user.isSuspended && (
              <span className="inline-block rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                Suspended
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-extrabold text-slate-950">
            Account Details
          </h2>
          <p className="mb-4 text-xs text-slate-400">Basic profile information</p>

          <InfoRow label="Full Name" value={fullName} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Username" value={`@${user.username}`} />
          <InfoRow label="Phone" value={user.phone ?? "—"} />
          <InfoRow
            label="Status"
            value={
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
                  user.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            }
          />
          <InfoRow label="Joined" value={fmt(user.createdAt)} />
          <InfoRow label="Last Login" value={fmt(user.lastLoginAt)} />
        </div>

        {/* Activity stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-extrabold text-slate-950">
            Activity
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            Content created by this user
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Businesses",
                value: counts?._count.businesses ?? 0,
                icon: "🏢",
              },
              {
                label: "Reviews",
                value: counts?._count.reviews ?? 0,
                icon: "⭐",
              },
              {
                label: "Ratings",
                value: counts?._count.ratings ?? 0,
                icon: "📊",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center"
              >
                <span className="text-2xl">{icon}</span>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {value}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {user.isSuspended && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs font-bold text-orange-700">
                Suspended{" "}
                {user.suspendedAt ? fmt(user.suspendedAt) : ""}
              </p>
              {user.suspensionReason && (
                <p className="mt-1 text-xs text-orange-600">
                  {user.suspensionReason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Roles section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-slate-950">
          Assigned Roles
        </h2>
        {user.roles.length === 0 ? (
          <p className="text-sm text-slate-400">No roles assigned to this user.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <span
                key={r.roleId}
                className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  ROLE_COLORS[r.role.name] ??
                  "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {r.role.name.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
