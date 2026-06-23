import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-[#111d63] px-4 py-2 text-sm font-semibold text-white",
        className,
      )}
      {...props}
    />
  );
}
