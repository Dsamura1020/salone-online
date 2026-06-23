import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  title?: string;
  children: ReactNode;
};

export function Dialog({
  open = true,
  title,
  className,
  children,
  ...props
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl",
          className,
        )}
        {...props}
      >
        {title ? (
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
