"use client";

import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "./icons";
import { GoogleIcon } from "@/features/auth/components/google-icon";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const csrfHeaderName = "x-csrf-token";

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function HeroLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    async function prepareGoogleLogin() {
      const [csrfResponse, providers] = await Promise.all([
        fetch("/api/security/csrf"),
        getProviders(),
      ]);
      const csrfBody = (await csrfResponse.json()) as ApiResult<{
        token: string;
      }>;

      if (csrfBody.success) {
        setCsrfToken(csrfBody.data.token);
      }
      setHasGoogle(Boolean(providers?.google));
    }

    void prepareGoogleLogin();
  }, []);

  function validate() {
    const nextErrors: Record<string, string> = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email, password, or unverified account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);

    if (!hasGoogle) {
      setError(
        "Google sign-in is ready in the UI, but GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured yet.",
      );
      return;
    }

    if (!csrfToken) {
      setError("Security token is still loading. Please try again.");
      return;
    }

    setGoogleLoading(true);

    const intentResponse = await fetch("/api/auth/oauth-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [csrfHeaderName]: csrfToken,
      },
      body: JSON.stringify({ accountType: "user" }),
    });

    if (!intentResponse.ok) {
      setGoogleLoading(false);
      setError("Could not prepare Google sign-in. Please try again.");
      return;
    }

    await signIn(
      "google",
      { callbackUrl: "/dashboard" },
      { prompt: "select_account" },
    );
    setGoogleLoading(false);
  }

  return (
    <section
      aria-label="Login"
      className="w-full rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200 sm:p-8 lg:p-10"
    >
      <div className="mb-7">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
          Login
        </h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <label className="block">
          <span className="text-sm font-bold text-slate-900">Email address</span>
          <span
            className={[
              "mt-2 flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 shadow-sm focus-within:ring-4",
              fieldErrors.email
                ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/10"
                : "border-slate-200 focus-within:border-[#27339a] focus-within:ring-[#27339a]/10",
            ].join(" ")}
          >
            <MailIcon className="size-5 shrink-0 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((current) => ({ ...current, email: "" }));
                }
              }}
              placeholder="you@example.com"
              className="w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
            />
          </span>
          {fieldErrors.email && (
            <span className="mt-2 block text-sm font-semibold text-red-600">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-900">Password</span>
          <span
            className={[
              "mt-2 flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 shadow-sm focus-within:ring-4",
              fieldErrors.password
                ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/10"
                : "border-slate-200 focus-within:border-[#27339a] focus-within:ring-[#27339a]/10",
            ].join(" ")}
          >
            <LockIcon className="size-5 shrink-0 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: "" }));
                }
              }}
              placeholder="Password"
              className="w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          </span>
          {fieldErrors.password && (
            <span className="mt-2 block text-sm font-semibold text-red-600">
              {fieldErrors.password}
            </span>
          )}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
          <label className="inline-flex items-center gap-2 text-slate-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-5 rounded border-slate-300 text-[#111d63] accent-[#111d63]"
            />
            Remember me
          </label>
          <a href="#contact" className="text-[#111d63] hover:underline">
            Forgot password?
          </a>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="min-h-13 w-full rounded-xl bg-[#111d63] px-5 text-base font-extrabold text-white shadow-lg shadow-[#111d63]/20 transition hover:bg-[#27339a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#111d63]" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>
      </form>
    </section>
  );
}
