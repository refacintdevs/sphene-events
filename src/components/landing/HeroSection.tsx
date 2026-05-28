import { HeroSearchForm } from "./HeroSearchForm";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Decorative blurred gradients — purely visual, pointer-events disabled */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[560px] w-[560px] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[480px] w-[480px] translate-y-1/4 -translate-x-1/4 rounded-full bg-secondary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-20 text-center md:py-28">
        {/* Eyebrow */}
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Verified Event Vendors · Lagos, Nigeria
        </p>

        {/* Headline */}
        <h1 className="mt-4 font-display text-5xl font-black tracking-tighter text-foreground md:text-7xl">
          Your event, in{" "}
          <span className="text-primary">trusted hands</span>.
        </h1>

        {/* Supporting copy */}
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Find verified caterers, decorators, and photographers for your next
          event. Every payment held safely in escrow until your event is done.
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-10 max-w-2xl">
          <HeroSearchForm />
        </div>

        {/* Social proof nudge */}
        <p className="mt-5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">3+ verified vendors</span>
          {" "}across catering, decoration and photography in Lagos
        </p>
      </div>
    </section>
  );
}
