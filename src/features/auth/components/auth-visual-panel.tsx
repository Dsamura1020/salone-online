import Link from "next/link";
import { Brand } from "@/components/landing/brand";
import { ArrowRightIcon } from "@/components/landing/icons";

const stats = [
  { value: "1.2k+", label: "Businesses" },
  { value: "932", label: "Verified" },
  { value: "18k", label: "Searches/mo" },
];

export function AuthVisualPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#111d63] text-white lg:block">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,18,73,0.96),rgba(17,29,99,0.88)),url('/images/salone3.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-[#081654]/80" />
      <div className="relative z-10 flex min-h-screen flex-col justify-between p-16">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-3 text-base font-bold text-white/72 transition hover:text-white"
        >
          <ArrowRightIcon className="size-5 rotate-180" />
          Back to home
        </Link>

        <div>
          <Brand tone="dark" showSubtitle={false} />
          <h1 className="mt-12 max-w-4xl text-5xl font-black leading-tight tracking-normal">
            Sierra Leone&apos;s most trusted business directory.
          </h1>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-8 text-white/76">
            Join thousands discovering verified businesses, sharing reviews, and
            growing the local economy.
          </p>
          <dl className="mt-16 grid max-w-3xl grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-4xl font-black">{stat.value}</dt>
                <dd className="mt-1 text-base font-medium text-white/70">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-sm font-semibold text-white/48">
          © 2026 SaloneOnline · Freetown, Sierra Leone
        </p>
      </div>
    </aside>
  );
}
