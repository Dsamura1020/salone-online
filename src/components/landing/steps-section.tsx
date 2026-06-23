import { ArrowRightIcon } from "./icons";

const steps = [
  {
    number: "1",
    title: "Search",
    description: "Use AI-powered search to describe what you need.",
  },
  {
    number: "2",
    title: "Discover",
    description: "Browse verified businesses that match your needs.",
  },
  {
    number: "3",
    title: "Compare",
    description: "Check ratings, reviews, and business details.",
  },
  {
    number: "4",
    title: "Connect",
    description: "Contact businesses directly and get started.",
  },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="border-b border-slate-200 bg-[#f4f7fb] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-black text-slate-950">How It Works</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {index < steps.length - 1 && (
                <ArrowRightIcon className="absolute left-[calc(50%+1.25rem)] top-4 hidden size-4 text-slate-300 lg:block" />
              )}
              <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-[#111d63] text-sm font-black text-white">
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-extrabold text-slate-950">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
