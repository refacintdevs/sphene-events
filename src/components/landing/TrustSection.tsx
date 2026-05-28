import { ShieldCheck, Lock, Scale } from "lucide-react";

const SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Verified vendors",
    body: "Every vendor submits proof of identity, a CAC certificate where applicable, and portfolio samples. Our team reviews each application before approval. You never book a stranger.",
  },
  {
    icon: Lock,
    title: "Escrow-backed payments",
    body: "Your deposit is held securely by Paystack until after your event. Vendors only receive funds once you confirm the event happened. Your money is never at risk.",
  },
  {
    icon: Scale,
    title: "Dispute protection",
    body: "If something goes wrong, our team steps in. We review both sides, examine evidence, and decide fairly. Refunds are issued where warranted — no runaround.",
  },
] as const;

export function TrustSection() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Built on trust
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Why Sphene Events is different
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {SIGNALS.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.title} className="flex flex-col">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {signal.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {signal.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
