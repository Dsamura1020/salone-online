"use client";

import type { FormEvent, HTMLAttributes } from "react";
import { useState } from "react";
import { Panel } from "@/components/layouts/dashboard-cards";
import { ShieldIcon } from "@/components/layouts/icons";
import { EyeIcon, EyeOffIcon } from "@/components/landing/icons";

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ChangePasswordCard() {
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestCode() {
    setLoading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/users/password/otp", {
      method: "POST",
    });
    const body = (await response.json()) as ApiResult<{
      sent: boolean;
      email: string;
    }>;

    setLoading(false);

    if (!body.success) {
      setError(body.error);
      return;
    }

    setCodeSent(true);
    setStatus(`We sent a six-digit code to ${body.data.email}.`);
  }

  async function confirmChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/users/password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otp,
        password,
        confirmPassword,
      }),
    });
    const body = (await response.json()) as ApiResult<{ changed: boolean }>;

    setLoading(false);

    if (!body.success) {
      setError(body.error);
      return;
    }

    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setCodeSent(false);
    setStatus("Your password has been changed.");
  }

  return (
    <Panel title="Security" subtitle="Change your account password by email code">
      <div className="space-y-4">
        {!codeSent ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void requestCode()}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldIcon className="size-4" />
            {loading ? "Sending code..." : "Change password"}
          </button>
        ) : (
          <form className="space-y-3" onSubmit={confirmChange}>
            <PasswordField
              label="Verification code"
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
            <PasswordField
              label="New password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="New password"
              showPasswordToggle
            />
            <PasswordField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              showPasswordToggle
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#10206f] px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save password"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void requestCode()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
        {status && !error && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            {status}
          </p>
        )}
      </div>
    </Panel>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  maxLength,
  showPasswordToggle = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  showPasswordToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const resolvedType = showPasswordToggle && type === "password" && visible
    ? "text"
    : type;

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold text-slate-950">
        {label}
      </span>
      <span className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:border-[#10206f]">
        <input
          required
          type={resolvedType}
          value={value}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        )}
      </span>
    </label>
  );
}
