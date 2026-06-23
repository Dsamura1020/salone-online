"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberProfile } from "@/features/users/services/member-dashboard-data";
import { Panel } from "@/components/layouts/dashboard-cards";
import { UploadIcon } from "@/components/layouts/icons";

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ProfileSettingsForm({
  profile,
}: {
  profile: MemberProfile;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    phone: profile.phone ?? "",
    timezone: profile.timezone ?? "",
    locale: profile.locale ?? "",
  });
  const [image, setImage] = useState(profile.image);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setStatus(null);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = (await response.json()) as ApiResult<MemberProfile>;

    setSaving(false);

    if (!body.success) {
      setError(body.error);
      return;
    }

    setStatus("Profile updated.");
    router.refresh();
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError(null);
    setStatus(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/users/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json()) as ApiResult<{ image: string | null }>;

    setUploading(false);

    if (!body.success) {
      setError(body.error);
      return;
    }

    setImage(body.data.image);
    setStatus("Profile photo updated.");
    router.refresh();
  }

  async function removeAvatar() {
    if (!image) {
      return;
    }

    setUploading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/users/profile/avatar", {
      method: "DELETE",
    });
    const body = (await response.json()) as ApiResult<{ image: string | null }>;

    setUploading(false);

    if (!body.success) {
      setError(body.error);
      return;
    }

    setImage(null);
    setStatus("Profile photo removed.");
    router.refresh();
  }

  return (
    <Panel title="Personal information" subtitle="Update your account details">
      <form onSubmit={saveProfile}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="size-20 overflow-hidden rounded-full bg-[#f49a52]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={`${form.firstName} ${form.lastName}`}
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-extrabold text-slate-950">
                {`${form.firstName[0] ?? "U"}${form.lastName[0] ?? ""}`.toUpperCase()}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadAvatar(file);
              }
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-extrabold shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UploadIcon className="size-4" />
            {uploading ? "Uploading..." : "Upload photo"}
          </button>
          <button
            type="button"
            disabled={uploading || !image}
            onClick={() => void removeAvatar()}
            className="text-xs font-extrabold text-slate-950 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
          <p className="basis-full text-xs font-semibold text-slate-500 sm:basis-auto">
            PNG, JPG, or WEBP up to 2MB. Square images recommended.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProfileField
            label="First name"
            value={form.firstName}
            onChange={(value) => update("firstName", value)}
            required
          />
          <ProfileField
            label="Last name"
            value={form.lastName}
            onChange={(value) => update("lastName", value)}
            required
          />
          <ProfileField
            label="Username"
            value={form.username}
            onChange={(value) => update("username", value)}
            required
          />
          <ProfileField label="Email" value={profile.email} readOnly />
          <ProfileField
            label="Phone"
            value={form.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+232 76 000 000"
          />
          <ProfileField
            label="Timezone"
            value={form.timezone}
            onChange={(value) => update("timezone", value)}
            placeholder="Africa/Freetown"
          />
          <ProfileField
            label="Locale"
            value={form.locale}
            onChange={(value) => update("locale", value)}
            placeholder="en-SL"
          />
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        {status && !error && (
          <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {status}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setForm({
                firstName: profile.firstName,
                lastName: profile.lastName,
                username: profile.username,
                phone: profile.phone ?? "",
                timezone: profile.timezone ?? "",
                locale: profile.locale ?? "",
              });
              setError(null);
              setStatus(null);
            }}
            className="rounded-lg px-4 py-2.5 text-xs font-extrabold text-slate-950"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#10206f] px-5 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  required,
  readOnly,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold text-slate-950">
        {label}
      </span>
      <input
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none read-only:bg-slate-50 read-only:text-slate-500"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}
