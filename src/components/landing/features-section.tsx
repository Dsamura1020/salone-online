import type { ComponentType } from "react";
import {
  BuildingIcon,
  MessageIcon,
  PinIcon,
  ShieldIcon,
  SparkleIcon,
  TrendingIcon,
} from "./icons";

type Feature = {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
};

const features: Feature[] = [
  {
    title: "Verified businesses",
    description: "Every approved listing passes admin review and document checks.",
    Icon: ShieldIcon,
  },
  {
    title: "Ratings & reviews",
    description: "Build trust with transparent public feedback and moderation.",
    Icon: MessageIcon,
  },
  {
    title: "Business onboarding",
    description: "Quick registration for SMEs, startups, and enterprises.",
    Icon: BuildingIcon,
  },
  {
    title: "AI semantic search",
    description: "Find businesses by intent, not just keywords.",
    Icon: SparkleIcon,
  },
  {
    title: "Location filtering",
    description: "Browse by district, city, and neighborhood across Sierra Leone.",
    Icon: PinIcon,
  },
  {
    title: "Smart recommendations",
    description: "Discover trending and similar businesses tailored to you.",
    Icon: TrendingIcon,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-slate-200 bg-[#f8fbff] py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg font-extrabold uppercase tracking-[0.18em] text-[#111d63] sm:text-xl">
            Why Choose Us?
          </p>
          <p className="mt-6 text-2xl font-semibold leading-9 text-slate-500 sm:text-3xl sm:leading-10">
            A complete platform for businesses and customers across Sierra Leone.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const { Icon } = feature;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-[#202a86] text-white">
        <Icon className="size-8" />
      </span>
      <h3 className="mt-8 text-2xl font-extrabold tracking-normal text-slate-950">
        {feature.title}
      </h3>
      <p className="mt-4 text-lg font-medium leading-8 text-slate-500">
        {feature.description}
      </p>
    </article>
  );
}
