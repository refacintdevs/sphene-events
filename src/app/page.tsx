import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <main className="min-h-screen px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header with toggle */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="font-display text-xl font-semibold tracking-tight">
              Sphene Events
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* Auth state — Unit 5 verification */}
        <section className="mt-10 rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="font-display text-lg font-semibold">Auth state</h2>
          {user ? (
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Email" value={user.email} />
              <Row label="Full name" value={user.fullName} />
              <Row label="Role" value={user.role} />
              <Row label="DB User ID" value={user.id} />
              <Row label="Clerk ID" value={user.clerkId} />
              <div className="mt-4">
                <SignOutButton>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </SignOutButton>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Not signed in.</span>
              <Button asChild size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Hero */}
        <section className="mt-20 md:mt-32">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Theme system check
          </p>
          <h1 className="mt-4 font-display text-5xl font-black tracking-tighter md:text-7xl">
            Verified vendors.
            <br />
            <span className="text-primary">Trusted bookings.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Book caterers, decorators, photographers, and more for events
            across Nigeria. Your deposit stays in escrow until your event is
            done.
          </p>
        </section>

        {/* Token swatches */}
        <section className="mt-20 md:mt-24">
          <h2 className="font-display text-2xl font-semibold">
            Color tokens
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All swatches use semantic tokens. Toggle the theme to see them
            adapt.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Swatch name="primary" className="bg-primary text-primary-foreground" />
            <Swatch name="secondary" className="bg-secondary text-secondary-foreground" />
            <Swatch name="success" className="bg-success text-success-foreground" />
            <Swatch name="warning" className="bg-warning text-warning-foreground" />
            <Swatch name="verified" className="bg-verified text-verified-foreground" />
            <Swatch name="destructive" className="bg-destructive text-destructive-foreground" />
            <Swatch name="muted" className="bg-muted text-muted-foreground" />
            <Swatch name="card" className="bg-card text-card-foreground border border-border" />
          </div>
        </section>

        {/* Typography check */}
        <section className="mt-20 md:mt-24">
          <h2 className="font-display text-2xl font-semibold">Typography</h2>
          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground md:p-10">
            <p className="font-display text-4xl font-semibold tracking-tight">
              Fraunces — display serif
            </p>
            <p className="text-base">
              Plus Jakarta Sans — body sans. The quick brown fox jumps over
              the lazy dog. ₦150,000 deposit held safely in escrow.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted body text for secondary information.
            </p>
          </div>
        </section>

        {/* shadcn/ui components check */}
        <section className="mt-20 md:mt-24">
          <h2 className="font-display text-2xl font-semibold">
            shadcn/ui components
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Button, Card, Badge, Dialog, and Skeleton — all using semantic
            tokens.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Primary button</Button>
            <Button variant="outline">Outline button</Button>
          </div>

          {/* Card with Badge */}
          <div className="mt-6">
            <Card className="max-w-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Sunshine Catering</CardTitle>
                  <Badge>Verified</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full-service catering for weddings, corporate events, and
                  private celebrations across Lagos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dialog */}
          <div className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Booking confirmation</DialogTitle>
                  <DialogDescription>
                    Your deposit will be held in escrow until after the event.
                    You can cancel up to 48 hours before the event date for a
                    full refund.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          {/* Skeleton */}
          <div className="mt-6 max-w-sm space-y-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </section>

        {/* Footer note */}
        <footer className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground md:mt-32">
          Phase 0 · Unit 5 — Clerk auth + lazy user sync verified.
        </footer>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all font-mono text-xs">{value}</span>
    </div>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`flex h-24 items-end rounded-xl p-3 text-xs font-medium ${className}`}
    >
      {name}
    </div>
  );
}