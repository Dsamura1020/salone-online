import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRightIcon, BuildingIcon, MessageIcon, ShieldIcon } from "./icons";

type Highlight = {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  href?: string;
};

const highlights: Highlight[] = [
  {
    title: "Verified businesses",
    description: "Every approved listing passes admin review",
    Icon: ShieldIcon,
    href: "/businesses/verified",
  },
  {
    title: "Ratings and reviews",
    description: "Build trust with public feedback",
    Icon: MessageIcon,
    href: "/businesses?focus=reviews",
  },
  {
    title: "Business onboarding",
    description: "Quick registration for SMEs and startups",
    Icon: BuildingIcon,
    href: "/login?mode=register-business&callbackUrl=/dashboard/owner/businesses/new",
  },
];

export function PlatformHighlights() {
  return (
    <section className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
              Platform Highlights
            </h2>
            <p className="mt-3 text-base font-medium text-slate-500">
              Core MVP capabilities across the platform
            </p>
          </div>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const { Icon } = item;
            const content = (
              <>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#111d63] transition group-hover:bg-[#111d63]/10">
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-[#111d63]">
                      {item.title}
                    </h3>
                    {item.href && (
                      <ArrowRightIcon className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#111d63]" />
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </>
            );

            if (!item.href) {
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-5"
                >
                  {content}
                </li>
              );
            }

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={[
                    "group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80",
                    item.title === "Ratings and reviews"
                      ? "hover:border-amber-200 hover:bg-amber-50/80"
                      : "hover:border-slate-300 hover:bg-white",
                  ].join(" ")}
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
