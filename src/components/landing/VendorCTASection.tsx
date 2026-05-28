import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VendorCTASection() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
          For vendors
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
          Are you an event vendor in Lagos?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
          Join EventIQ and connect with customers looking for exactly what
          you offer. Verification is free during our beta period.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            {/* /sign-up?role=vendor — the param isn't handled yet; that's Phase 1 vendor onboarding */}
            <Link href="/sign-up">
              Join as a vendor
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/for-vendors">Learn more</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
