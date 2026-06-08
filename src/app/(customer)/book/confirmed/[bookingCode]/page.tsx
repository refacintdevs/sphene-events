import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findCurrentUser } from "@/lib/auth";
import { getBookingConfirmation } from "@/services/booking";
import { formatNaira } from "@/lib/format";

interface PageProps {
  params: Promise<{ bookingCode: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingCode } = await params;
  return { title: `Booking ${bookingCode} Confirmed — EventIQ` };
}

export default async function BookingConfirmedPage({ params }: PageProps) {
  const { bookingCode } = await params;

  // findCurrentUser() is read-only (no upsert side effect — AD-010).
  // The (customer) layout already gate-checked the role; here we just need the id.
  const user = await findCurrentUser();
  if (!user) notFound();

  const booking = await getBookingConfirmation(bookingCode, user.id);
  if (!booking) notFound();

  const dateStr = booking.eventDate.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Success header ─────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <CheckCircle
          className="mx-auto mb-4 h-14 w-14 text-secondary"
          aria-hidden="true"
        />
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Request sent!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your booking request has been sent to{" "}
          <span className="font-medium text-foreground">{booking.vendorName}</span>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The vendor has 48 hours to accept or decline. You&apos;ll be notified
          by email once they respond.
        </p>
      </div>

      {/* ── Booking details card ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Booking code */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Booking reference
          </span>
          <span className="rounded-md bg-muted/60 px-2.5 py-1 font-mono text-sm font-semibold text-foreground">
            {booking.bookingCode}
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
            <Calendar
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

        {/* Amount summary */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {formatNaira(booking.totalAmountKobo)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Deposit due on acceptance</span>
            <span className="font-medium text-primary">
              {formatNaira(booking.depositAmountKobo)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Balance after event</span>
            <span className="text-foreground">
              {formatNaira(booking.balanceAmountKobo)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          No payment is taken now. The deposit is due once the vendor accepts
          your request.
        </p>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button asChild>
          {/* Forward stub — /dashboard/bookings does not exist yet (Unit 2.4) */}
          <Link href="/dashboard/bookings">
            View my bookings
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
