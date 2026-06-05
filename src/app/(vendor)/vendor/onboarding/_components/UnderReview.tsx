import { CheckCircle, Clock } from "lucide-react";

const NEXT_STEPS = [
  "Our team will review your business information, documents, and portfolio samples.",
  "You'll receive an email with the outcome — approval, or guidance on what to update.",
  "Once approved, your profile goes live and customers can start booking you on EventIQ.",
];

export function UnderReview() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:px-0">
      {/* Status icon + heading */}
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
          Your application is under review
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          We&rsquo;ve received everything. Our team will review your submission within
          72&nbsp;hours and send you an email once a decision is made.
        </p>
      </div>

      {/* What happens next */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          What happens next
        </h2>
        <ol className="space-y-4">
          {NEXT_STEPS.map((step, i) => (
            <li key={i} className="flex gap-3">
              <CheckCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Questions? Reach us at{" "}
        <a
          href="mailto:hello@eventiq.ng"
          className="text-foreground underline-offset-2 hover:underline"
        >
          hello@eventiq.ng
        </a>
      </p>
    </div>
  );
}
