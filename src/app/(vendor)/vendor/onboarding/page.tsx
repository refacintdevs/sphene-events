import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Onboarding — EventIQ",
};

export default function VendorOnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Vendor Setup
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Vendor onboarding
        </h1>
        <p className="text-sm text-muted-foreground">
          Coming in Slice B — the multi-step onboarding form will be built here.
        </p>
      </div>
    </div>
  );
}
