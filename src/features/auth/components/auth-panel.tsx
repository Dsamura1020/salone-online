"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BuildingIcon,
  LockIcon,
  MailIcon,
  UsersIcon,
} from "@/components/landing/icons";
import { AuthField } from "./auth-field";

const csrfHeaderName = "x-csrf-token";

type PrimaryMode = "signin" | "register";
type RegisterKind = "user" | "business";
type FieldErrors = Record<string, string>;
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function readApiResult<T>(response: Response): Promise<ApiResult<T>> {
  const text = await response.text();

  if (!text) {
    return {
      success: false,
      error: "The server did not return a response. Please try again.",
    };
  }

  try {
    const body = JSON.parse(text) as ApiResult<T>;
    if (typeof body === "object" && body && "success" in body) {
      return body;
    }
  } catch {
    // Fall through to a user-friendly error below.
  }

  return {
    success: false,
    error: response.ok
      ? "The server returned an unexpected response. Please try again."
      : "The request could not be completed. Please try again.",
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sierraLeoneBusinessCategories = [
  "Agriculture & Agribusiness",
  "Restaurants, Food & Catering",
  "Retail & Wholesale Trade",
  "ICT & Technology Services",
  "Health & Medical Services",
  "Education & Training",
  "Tourism & Hospitality",
  "Transportation & Logistics",
  "Construction & Real Estate",
  "Financial Services",
  "Legal & Professional Services",
  "Beauty & Personal Care",
  "Entertainment, Media & Events",
  "Manufacturing & Production",
  "Mining & Natural Resources",
  "Energy & Utilities",
  "Nonprofit & Community Services",
];

export function AuthPanel() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode");
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    (initialMode === "register-business"
      ? "/dashboard/owner/businesses/new"
      : "/dashboard");

  const [mode, setMode] = useState<PrimaryMode>(
    initialMode?.startsWith("register") ? "register" : "signin",
  );
  const [registerKind, setRegisterKind] = useState<RegisterKind>(
    initialMode === "register-business" ? "business" : "user",
  );
  const [csrfToken, setCsrfToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [pendingRedirect, setPendingRedirect] = useState(callbackUrl);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isVerifying = Boolean(pendingEmail);

  useEffect(() => {
    async function prepareAuth() {
      const csrfResponse = await fetch("/api/security/csrf");
      const csrfBody = (await csrfResponse.json()) as ApiResult<{
        token: string;
      }>;

      if (csrfBody.success) {
        setCsrfToken(csrfBody.data.token);
      }
    }

    void prepareAuth();
  }, []);

  const title = useMemo(() => {
    if (isVerifying) {
      return "Verify your email";
    }
    return mode === "signin" ? "Welcome back" : "Create your account";
  }, [isVerifying, mode]);

  const subtitle = useMemo(() => {
    if (isVerifying) {
      return `Enter the six-digit code sent to ${pendingEmail}.`;
    }
    return mode === "signin"
      ? "Login to manage your account and business listings."
      : "Join SaloneOnline to discover or list businesses.";
  }, [isVerifying, mode, pendingEmail]);

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 grid rounded-full border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setPendingEmail("");
              setError(null);
            }}
            className={tabClass(mode === "signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setPendingEmail("");
              setError(null);
            }}
            className={tabClass(mode === "register")}
          >
            Create Account
          </button>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-2xl shadow-slate-200 ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-black tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500">
          {subtitle}
        </p>

        <div className="mt-6">
          {isVerifying ? (
            <OtpForm
              csrfToken={csrfToken}
              email={pendingEmail}
              password={pendingPassword}
              redirectTo={pendingRedirect}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              setStatus={setStatus}
              onBack={() => setPendingEmail("")}
            />
          ) : mode === "signin" ? (
            <SignInForm
              callbackUrl={callbackUrl}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          ) : (
            <RegisterForm
              csrfToken={csrfToken}
              kind={registerKind}
              setKind={setRegisterKind}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              setStatus={setStatus}
              onPendingOtp={(email, password, redirectTo) => {
                setPendingEmail(email);
                setPendingPassword(password);
                setPendingRedirect(redirectTo);
              }}
            />
          )}
        </div>

        {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}
        {status && !error && (
          <p className="mt-5 text-sm font-semibold text-[#111d63]">{status}</p>
        )}

        {!isVerifying && (
          <p className="mt-7 text-center text-sm font-semibold text-slate-500">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "register" : "signin");
                setError(null);
                setStatus(null);
              }}
              className="font-extrabold text-[#111d63] hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        )}
      </section>
    </div>
  );
}

function SignInForm({
  callbackUrl,
  loading,
  setLoading,
  setError,
}: {
  callbackUrl: string;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate() {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (errors.email) {
      setErrors((current) => ({ ...current, email: "" }));
    }
  }

  function updatePassword(value: string) {
    setPassword(value);
    if (errors.password) {
      setErrors((current) => ({ ...current, password: "" }));
    }
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

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <AuthField
        label="Email address"
        Icon={MailIcon}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => updateEmail(event.target.value)}
        error={errors.email}
      />
      <AuthField
        label="Password"
        Icon={LockIcon}
        type="password"
        showPasswordToggle
        placeholder="Password"
        value={password}
        onChange={(event) => updatePassword(event.target.value)}
        error={errors.password}
      />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        <label className="inline-flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-5 rounded border-slate-300 accent-[#111d63]"
          />
          Remember me
        </label>
        <a href="#forgot" className="text-[#111d63] hover:underline">
          Forgot password?
        </a>
      </div>
      <SubmitButton loading={loading}>Sign in</SubmitButton>
    </form>
  );
}

function RegisterForm({
  csrfToken,
  kind,
  setKind,
  loading,
  setLoading,
  setError,
  setStatus,
  onPendingOtp,
}: {
  csrfToken: string;
  kind: RegisterKind;
  setKind: (kind: RegisterKind) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setStatus: (value: string | null) => void;
  onPendingOtp: (email: string, password: string, redirectTo: string) => void;
}) {
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    categoryName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  }

  function updateAgree(value: boolean) {
    setAgree(value);
    if (errors.agree) {
      setErrors((current) => ({ ...current, agree: "" }));
    }
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = form.email.trim();

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (kind === "business") {
      if (!form.businessName.trim()) {
        nextErrors.businessName = "Business name is required.";
      }
      if (!form.categoryName.trim()) {
        nextErrors.categoryName = "Choose an industry / category.";
      }
    }

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      nextErrors.password = "Password must include a letter and a number.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agree) {
      nextErrors.agree = "You must agree before creating an account.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!validate()) {
      return;
    }

    if (!csrfToken) {
      setError("Security token is still loading. Please try again.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    const payload =
      kind === "user"
        ? {
            accountType: "user",
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone || undefined,
            password: form.password,
            confirmPassword: form.confirmPassword,
          }
        : {
            accountType: "business",
            firstName: form.firstName,
            lastName: form.lastName,
            businessName: form.businessName,
            categoryName: form.categoryName,
            email: form.email,
            phone: form.phone || undefined,
            password: form.password,
            confirmPassword: form.confirmPassword,
          };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfHeaderName]: csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const body = await readApiResult<{
        email: string;
        requiresOtp: boolean;
        businessId?: string | null;
      }>(response);

      if (!body.success) {
        setError(body.error);
        return;
      }

      const redirectTo =
        kind === "business" && body.data.businessId
          ? `/dashboard/owner/businesses/${body.data.businessId}/edit`
          : kind === "business"
            ? "/dashboard/owner/businesses/new"
            : "/dashboard";

      setStatus("We sent a six-digit verification code to your email.");
      onPendingOtp(body.data.email, form.password, redirectTo);
    } catch {
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3.5" onSubmit={onSubmit} noValidate>
      <div className="grid rounded-full border border-slate-200 bg-slate-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setKind("user")}
            className={subTabClass(kind === "user")}
          >
            <UsersIcon className="size-5" />
            User
          </button>
          <button
            type="button"
            onClick={() => setKind("business")}
            className={subTabClass(kind === "business")}
          >
            <BuildingIcon className="size-5" />
            Register Business
          </button>
        </div>
      </div>

      {kind === "user" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthField
            label="First name"
            placeholder="Aminata"
            value={form.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            error={errors.firstName}
          />
          <AuthField
            label="Last name"
            placeholder="Kamara"
            value={form.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            error={errors.lastName}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AuthField
              label="First Name"
              placeholder="Aminata"
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              error={errors.firstName}
            />
            <AuthField
              label="Last Name"
              placeholder="Kamara"
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              error={errors.lastName}
            />
          </div>
          <AuthField
            label="Business name"
            Icon={BuildingIcon}
            placeholder="Makeni Tech Hub"
            value={form.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            error={errors.businessName}
          />
          <SelectField
            label="Industry / Category"
            Icon={BuildingIcon}
            value={form.categoryName}
            onChange={(event) => update("categoryName", event.target.value)}
            error={errors.categoryName}
            options={sierraLeoneBusinessCategories}
          />
        </>
      )}

      <AuthField
        label="Email address"
        Icon={MailIcon}
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        error={errors.email}
      />
      <AuthField
        label="Phone number"
        type="tel"
        placeholder="+232 76 000 000"
        value={form.phone}
        onChange={(event) => update("phone", event.target.value)}
      />
      <AuthField
        label="Password"
        Icon={LockIcon}
        type="password"
        showPasswordToggle
        placeholder="Password"
        value={form.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
      />
      <AuthField
        label="Confirm password"
        Icon={LockIcon}
        type="password"
        showPasswordToggle
        placeholder="Confirm password"
        value={form.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        error={errors.confirmPassword}
      />

      <div className="pt-2">
        <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-500">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => updateAgree(event.target.checked)}
            className="mt-0.5 size-5 rounded border-slate-300 accent-[#111d63]"
          />
          <span>
            I agree to the{" "}
            <a href="#terms" className="font-extrabold text-[#111d63]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" className="font-extrabold text-[#111d63]">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.agree && (
          <p className="mt-1 text-xs font-semibold text-red-600">{errors.agree}</p>
        )}
      </div>

      <SubmitButton loading={loading}>
        {kind === "business" ? "Register Business" : "Create account"}
      </SubmitButton>
    </form>
  );
}

function OtpForm({
  csrfToken,
  email,
  password,
  redirectTo,
  loading,
  setLoading,
  setError,
  setStatus,
  onBack,
}: {
  csrfToken: string;
  email: string;
  password: string;
  redirectTo: string;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setStatus: (value: string | null) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function updateOtp(value: string) {
    setOtp(value.replace(/\D/g, ""));
    if (errors.otp) {
      setErrors((current) => ({ ...current, otp: "" }));
    }
  }

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!otp) {
      nextErrors.otp = "Verification code is required.";
    } else if (!/^[0-9]{6}$/.test(otp)) {
      nextErrors.otp = "Enter the 6-digit verification code.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [csrfHeaderName]: csrfToken,
      },
      body: JSON.stringify({ email, otp }),
    });
    const body = await readApiResult<{ redirectTo: string }>(response);

    if (!body.success) {
      setLoading(false);
      setError(body.error);
      return;
    }

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email verified. Please sign in with your password.");
      onBack();
      return;
    }

    router.push(redirectTo || body.data.redirectTo);
    router.refresh();
  }

  async function resendOtp() {
    setError(null);
    setStatus(null);
    const response = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [csrfHeaderName]: csrfToken,
      },
      body: JSON.stringify({ email }),
    });
    const body = await readApiResult<{ sent: boolean }>(response);
    if (!body.success) {
      setError(body.error);
      return;
    }
    setStatus("A new verification code has been sent.");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <AuthField
        label="Verification code"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="123456"
        value={otp}
        onChange={(event) => updateOtp(event.target.value)}
        error={errors.otp}
      />
      <div className="pt-1">
        <SubmitButton loading={loading}>Verify and continue</SubmitButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        <button type="button" onClick={onBack} className="text-slate-500">
          Change email
        </button>
        <button
          type="button"
          onClick={resendOtp}
          className="font-extrabold text-[#111d63] hover:underline"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}

function SelectField({
  label,
  Icon,
  value,
  onChange,
  error,
  options,
}: {
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-[13px] font-bold text-slate-900">{label}</span>
      <span
        className={[
          "mt-1.5 flex min-h-11 items-center gap-2.5 rounded-xl border bg-white px-3.5 shadow-sm focus-within:ring-4",
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/10"
            : "border-slate-200 focus-within:border-[#27339a] focus-within:ring-[#27339a]/10",
        ].join(" ")}
      >
        {Icon && <Icon className="size-5 shrink-0 text-slate-500" />}
        <select
          value={value}
          onChange={onChange}
          className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-950 outline-none"
        >
          <option value="">Choose an industry / category</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="min-h-11 w-full rounded-xl bg-[#111d63] px-5 text-sm font-extrabold text-white shadow-lg shadow-[#111d63]/20 transition hover:bg-[#27339a] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

function tabClass(active: boolean) {
  return [
    "min-h-11 rounded-full text-sm font-extrabold transition",
    active ? "bg-[#202a86] text-white shadow-lg" : "text-slate-500 hover:text-slate-900",
  ].join(" ");
}

function subTabClass(active: boolean) {
  return [
    "flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-extrabold transition",
    active
      ? "bg-[#202a86] text-white shadow-md"
      : "text-slate-500 hover:text-slate-900",
  ].join(" ");
}
