import { useState } from "react";
import type { ComponentType, InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/landing/icons";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  Icon?: ComponentType<{ className?: string }>;
  error?: string;
  showPasswordToggle?: boolean;
};

export function AuthField({
  label,
  Icon,
  className,
  error,
  showPasswordToggle,
  type,
  ...props
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const resolvedType = showPasswordToggle && type === "password" && visible
    ? "text"
    : type;

  return (
    <label className={className}>
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
        <input
          {...props}
          type={resolvedType}
          className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOffIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        )}
      </span>
      {error && (
        <span className="mt-1 block text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
