import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table
        className={cn("min-w-full divide-y divide-zinc-200 text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-zinc-50", className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-zinc-200 bg-white", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-zinc-50", className)} {...props} />;
}

export function TableHeaderCell({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-zinc-700", className)} {...props} />;
}
