import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { BusinessSummary, SavedBusiness } from "@/features/users/services/dashboard-data";
import {
  ArrowUpRightIcon,
  BookmarkIcon,
  BuildingIcon,
  CheckIcon,
  EditIcon,
  EyeIcon,
  FileIcon,
  MessageIcon,
  PinIcon,
  ShieldIcon,
  StarIcon,
  TrendingIcon,
  UploadIcon,
} from "./icons";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "navy" | "orange" | "soft";
  icon: ComponentType<{ className?: string }>;
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "soft",
  icon: Icon,
}: MetricCardProps) {
  const iconClass =
    tone === "orange"
      ? "bg-[#f49a52] text-slate-950"
      : tone === "navy"
        ? "bg-[#e9edf6] text-[#10206f]"
        : "bg-slate-100 text-[#10206f]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold leading-none text-slate-950">
            {value}
          </p>
          <p className="mt-3 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function OwnerBusinessRows({
  businesses,
}: {
  businesses: BusinessSummary[];
}) {
  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <div
          key={business.id}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-extrabold text-slate-950">
            {business.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold text-slate-950">
              {business.name}
            </h3>
            <p className="truncate text-xs font-semibold text-slate-500">
              {business.category} · {business.location}
            </p>
          </div>
          <p className="hidden text-xs font-semibold text-slate-500 sm:block">
            {business.views} views
          </p>
          <StatusBadge status={business.status} />
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "verified" | "pending_review" | "incomplete" | "rejected";
}) {
  const styles: Record<typeof status, string> = {
    verified: "bg-emerald-600 text-white",
    pending_review: "border border-amber-200 bg-amber-50 text-amber-800",
    incomplete: "border border-slate-200 bg-slate-50 text-slate-700",
    rejected: "border border-red-200 bg-red-50 text-red-700",
  };

  const labels: Record<typeof status, string> = {
    verified: "Verified",
    pending_review: "Pending review",
    incomplete: "Incomplete",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-extrabold ${styles[status]}`}
    >
      {status === "verified" ? <ShieldIcon className="size-4" /> : null}
      {labels[status]}
    </span>
  );
}

export function MemberBusinessRows({
  businesses,
}: {
  businesses: BusinessSummary[];
}) {
  return (
    <div className="space-y-3">
      {businesses.map((business) => {
        const href = business.slug
          ? `/businesses/${business.slug}?mode=view`
          : `/businesses`;

        return (
          <Link
            key={business.id}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {business.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.imageUrl}
                  alt={business.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-sm font-extrabold text-slate-600">
                  {business.initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-extrabold text-slate-950">
                {business.name}
              </h3>
              <p className="truncate text-xs font-semibold text-slate-500">
                {business.category}
              </p>
            </div>
            <StatusBadge status={business.status} />
            <ArrowUpRightIcon className="size-4 shrink-0 text-slate-400" />
          </Link>
        );
      })}
    </div>
  );
}

type MemberActivityTone =
  | "green"
  | "orange"
  | "navy"
  | "slate"
  | "purple"
  | "red";

export function MemberActivityList({
  items,
}: {
  items: {
    id: string;
    title: string;
    description: string;
    time: string;
    tone: MemberActivityTone;
  }[];
}) {
  const iconByTone: Record<
    MemberActivityTone,
    ComponentType<{ className?: string }>
  > = {
    green: ShieldIcon,
    orange: StarIcon,
    navy: MessageIcon,
    slate: EyeIcon,
    purple: TrendingIcon,
    red: FileIcon,
  };

  const bgByTone: Record<MemberActivityTone, string> = {
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-amber-100 text-amber-700",
    navy: "bg-indigo-100 text-indigo-700",
    slate: "bg-slate-100 text-slate-600",
    purple: "bg-violet-100 text-violet-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <Panel title="Recent Activity" subtitle="Latest platform updates">
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = iconByTone[item.tone];

          return (
            <div key={item.id} className="flex gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bgByTone[item.tone]}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-950">{item.title}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {item.description}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function ActivityList({
  title = "Recent Activity",
  subtitle = "Latest platform updates",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: {
    id?: string;
    text: string;
    tone?: "green" | "orange" | "navy" | "slate";
  }[];
}) {
  const colors = {
    green: "bg-emerald-400",
    orange: "bg-[#ef8b3d]",
    navy: "bg-[#10206f]",
    slate: "bg-slate-500",
  };

  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id ?? item.text} className="flex gap-4">
            <span
              className={`mt-2 size-2.5 shrink-0 rounded-full ${colors[item.tone ?? "navy"]}`}
            />
            <p className="text-sm font-semibold leading-relaxed text-slate-950">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function SavedBusinessRows({
  businesses,
}: {
  businesses: SavedBusiness[];
}) {
  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <Link
          key={business.id}
          href={`/businesses/${business.slug}?mode=view`}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-extrabold">
            {business.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold text-slate-950">
              {business.name}
            </h3>
            <p className="truncate text-xs font-semibold text-slate-500">
              {business.category} · {business.location}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <StarIcon className="size-5 fill-[#ef8b3d] text-[#ef8b3d]" />
            {business.rating}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function SavedBusinessCard({
  business,
  detailsHref = `/businesses/${business.slug}?mode=view`,
  reviewHref = `/businesses/${business.slug}?mode=review#reviews`,
}: {
  business: SavedBusiness;
  detailsHref?: string;
  reviewHref?: string;
}) {

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-base font-extrabold">
            {business.initials}
          </span>
          <div>
            <h2 className="text-base font-extrabold text-slate-950">
              {business.name}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {business.category}
            </p>
          </div>
        </div>
        <BookmarkIcon className="size-5 fill-[#ef8b3d] text-[#ef8b3d]" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-2">
          <StarIcon className="size-5 fill-[#ef8b3d] text-[#ef8b3d]" />
          {business.rating} ({business.reviewCount})
        </span>
        <span className="inline-flex items-center gap-2">
          <PinIcon className="size-5" />
          {business.location}
        </span>
        {business.isVerified && (
          <span className="rounded-lg border border-emerald-200 px-3 py-1 font-extrabold text-emerald-600">
            Verified
          </span>
        )}
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
        {business.description}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={detailsHref}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-extrabold text-slate-950 shadow-sm"
        >
          View
        </Link>
        <Link
          href={reviewHref}
          className="rounded-lg bg-[#10206f] px-4 py-3 text-center text-xs font-extrabold text-white shadow-sm"
        >
          Review
        </Link>
      </div>
    </article>
  );
}

export function OwnerBusinessCard({ business }: { business: BusinessSummary }) {
  const editHref = `/dashboard/owner/businesses/${business.id}/edit`;
  const viewHref = `/dashboard/owner/businesses/${business.id}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-24 bg-gradient-to-r from-[#071451] to-[#2f3d9b]" />
      <div className="p-5 pt-0">
        <div className="-mt-6 flex items-start justify-between gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-lg font-extrabold shadow-sm">
            {business.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.imageUrl}
                alt={`${business.name} logo`}
                className="size-full object-cover"
              />
            ) : (
              business.initials
            )}
          </span>
          <StatusBadge status={business.status} />
        </div>
        <h2 className="mt-[-38px] ml-20 text-lg font-extrabold text-slate-950">
          {business.name}
        </h2>
        <p className="ml-20 text-xs font-semibold text-slate-500">
          {business.category} · {business.location}
        </p>
        <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 py-4 text-center">
          <BusinessStat icon={EyeIcon} value={business.views} label="Views" />
          <BusinessStat icon={StarIcon} value={business.rating} label="Rating" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href={editHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold shadow-sm"
          >
            <EditIcon className="size-5" />
            Edit
          </Link>
          <Link
            href={viewHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10206f] px-4 py-3 text-xs font-extrabold text-white shadow-sm"
          >
            <ArrowUpRightIcon className="size-5" />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function BusinessStat({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div>
      <Icon className="mx-auto mb-2 size-4 text-slate-500" />
      <p className="text-base font-extrabold text-slate-950">{value}</p>
      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

export function ProfileSettingsCard({
  userName,
  userEmail,
  initials,
}: {
  userName: string;
  userEmail: string;
  initials: string;
}) {
  const [firstName, ...rest] = userName.split(" ");
  const lastName = rest.join(" ") || "Account";

  return (
    <Panel title="Personal information">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-20 items-center justify-center rounded-full bg-[#f49a52] text-2xl font-extrabold">
          {initials}
        </span>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-extrabold shadow-sm">
          <UploadIcon className="size-4" />
          Upload avatar
        </button>
        <button className="text-xs font-extrabold text-slate-950">Remove</button>
        <p className="basis-full text-xs font-semibold text-slate-500 sm:basis-auto">
          PNG or JPG up to 2MB. Square images recommended.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ProfileField label="First name" value={firstName} />
        <ProfileField label="Last name" value={lastName} />
        <ProfileField label="Email" value={userEmail} />
        <ProfileField label="Phone" value="+232 76 000 000" />
        <ProfileField label="City" value="Freetown" />
        <ProfileField label="District" value="Western Area" />
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-extrabold text-slate-950">Bio</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none"
          defaultValue="Entrepreneur passionate about connecting Sierra Leonean businesses with customers across the region."
        />
      </label>
      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-lg px-4 py-2.5 text-xs font-extrabold text-slate-950">
          Cancel
        </button>
        <button className="rounded-lg bg-[#10206f] px-5 py-2.5 text-xs font-extrabold text-white">
          Save changes
        </button>
      </div>
    </Panel>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold text-slate-950">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none"
        defaultValue={value}
      />
    </label>
  );
}

export function RoleCard() {
  return (
    <Panel title="Role">
      <div className="space-y-4">
        <RoleRow title="Business Owner" subtitle="Manage 4 listings" status="Active" />
        <RoleRow title="Member" subtitle="Discover & save businesses" status="Available" />
      </div>
      <p className="mt-5 text-xs font-semibold leading-relaxed text-slate-500">
        An admin can promote your account to additional roles.
      </p>
    </Panel>
  );
}

function RoleRow({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
        <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-950">
        {status}
      </span>
    </div>
  );
}

export function SecurityCard() {
  return (
    <Panel title="Security">
      <div className="space-y-3">
        <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold shadow-sm">
          <ShieldIcon className="size-4" />
          Change password
        </button>
      </div>
    </Panel>
  );
}

export function metricIconSet() {
  return {
    building: BuildingIcon,
    message: MessageIcon,
    eye: EyeIcon,
    trending: TrendingIcon,
    bookmark: BookmarkIcon,
    shield: ShieldIcon,
  };
}

export function LinkAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-950"
    >
      {label}
      <ArrowUpRightIcon className="size-4" />
    </Link>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <CheckIcon className="mx-auto mb-4 size-8 text-[#10206f]" />
      <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
      {children ?? (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          This section is ready for the next business feature.
        </p>
      )}
    </div>
  );
}
