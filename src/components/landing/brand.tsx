import Link from "next/link";
import { BuildingIcon } from "./icons";

type BrandProps = {
  tone?: "light" | "dark";
  showSubtitle?: boolean;
};

export function Brand({ tone = "light", showSubtitle = true }: BrandProps) {
  const isDark = tone === "dark";

  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span
        className={[
          "flex size-9 items-center justify-center rounded-lg",
          isDark ? "bg-white/10 text-white" : "bg-[#111d63] text-white",
        ].join(" ")}
      >
        <BuildingIcon className="size-4" />
      </span>
      <span>
        <span
          className={[
            "block text-base font-extrabold leading-tight sm:text-lg",
            isDark ? "text-white" : "text-slate-950",
          ].join(" ")}
        >
          SaloneOnline
        </span>
        {showSubtitle && (
          <span
            className={[
              "mt-0.5 block text-xs font-medium",
              isDark ? "text-white/60" : "text-slate-500",
            ].join(" ")}
          >
            Discover verified businesses with AI-powered search
          </span>
        )}
      </span>
    </Link>
  );
}
