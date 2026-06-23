import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#111d63]",
        className,
      )}
      {...props}
    />
  );
}
