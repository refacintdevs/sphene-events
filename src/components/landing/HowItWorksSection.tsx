import { Search, CreditCard, CheckCircle } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Browse verified vendors",
    description:
      "Search caterers, decorators, and photographers in Lagos. Every vendor is reviewed and approved by our team before they appear in results.",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Book and pay a deposit",
    description:
      "Choose your date and service package. Pay a secure 30% deposit via Paystack — your money is held in escrow and never released until after your event.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Event done, vendor gets paid",
    description:
      "Once your event happens and you confirm it went well, the vendor receives their payment. No disputes? Seamless. Problems? We step in.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
      {/* Section header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Simple and transparent
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          How EventIQ works
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative flex flex-col">
              {/* Decorative step number */}
              <span
                className="font-display text-7xl font-black leading-none text-primary/10 select-none"
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div className="-mt-4">
                {/* Icon badge */}
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
