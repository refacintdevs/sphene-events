// NOTE: This file lives at book/[serviceId]/pay/page.tsx and reuses the
// existing [serviceId] dynamic segment. The URL parameter received here is a
// booking code (e.g. SE-2026-0014), NOT a service ID. A separate [bookingCode]
// folder at the same path level would conflict with [serviceId] in the Next.js
// router; both would match the same URL pattern. The local rename below
// (serviceId → bookingCode) makes intent clear. See feature-specs §6 step 3.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findCurrentUser } from "@/lib/auth";
import { getBookingForPayment } from "@/services/booking";
import { formatNaira } from "@/lib/format";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceId: bookingCode } = await params;
  return { title: `Pay Deposit — ${bookingCode} — EventIQ` };
}

export default async function PayDepositPage({ params }: PageProps) {
  const { serviceId: bookingCode } = await params;

  // findCurrentUser() is read-only (AD-010). Layout already gate-checks role;
  // we call it here to get the user id for ownership verification.
  const user = await findCurrentUser();
  if (!user) notFound();

  // Ownership + status gate: returns null if booking not found, customerId
  // mismatch, or status !== ACCEPTED. All three are required (feature-specs §6).
  const booking = await getBookingForPayment(bookingCode, user.id);
  if (!booking) notFound();

  const dateStr = booking.eventDate.toLocaleDateString("en-NG", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    timeZone: "Africa/Lagos",
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/dashboard/bookings"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to my bookings
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Pay deposit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure your booking by paying the deposit.
        </p>
      </div>

      {/* Booking summary card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Booking reference */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Booking reference
          </span>
          <span className="rounded-md bg-muted/60 px-2.5 py-1 font-mono text-sm font-semibold text-foreground">
            {bookingCode}
          </span>
        </div>

        <div className="border-t border-border" />

        {/* Service + vendor */}
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Service
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {booking.serviceName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vendor
            </dt>
            <dd className="mt-0.5 text-foreground">{booking.vendorName}</dd>
          </div>

          {/* Event date */}
          <div className="flex items-start gap-2">
            <CalendarDays
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Event date
              </dt>
              <dd className="mt-0.5 text-foreground">{dateStr}</dd>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Location
              </dt>
              <dd className="mt-0.5 text-foreground">{booking.eventLocation}</dd>
            </div>
          </div>
        </dl>

        <div className="border-t border-border" />

        {/* Deposit amount — prominent display */}
        <div className="rounded-xl bg-muted/30 px-4 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deposit due now
          </p>
          <p className="mt-1.5 font-display text-3xl font-semibold text-primary">
            {formatNaira(booking.depositAmountKobo)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            30% of total. Held in escrow until your event is complete.
          </p>
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-5 rounded-xl border border-border bg-card px-5 py-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          What happens next
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Your deposit is paid and held securely in escrow.</li>
          <li>The vendor coordinates event details with you directly.</li>
          <li>
            After your event, confirm completion to release payment to the vendor.
          </li>
        </ol>
      </div>

      {/* Pay button — STUB */}
      <div className="mt-8">
        {/* STUB (Unit 2.3): Paystack initialization not yet wired.
            Page, ACCEPTED-gating, and deposit display are real;
            only the payment call is stubbed. */}
        <Button disabled className="w-full" size="lg">
          Pay {formatNaira(booking.depositAmountKobo)} deposit
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Payment integration coming in the next build step
        </p>
      </div>
    </main>
  );
}
