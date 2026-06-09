import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findCurrentUser } from "@/lib/auth";
import { getCustomerBookings } from "@/services/booking";
import { formatNaira } from "@/lib/format";
import type { CustomerBookingItem } from "@/services/booking";

export const metadata: Metadata = { title: "My Bookings — EventIQ" };

// ── Status chip ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING_VENDOR: "Awaiting vendor response",
  ACCEPTED:       "Accepted — pay deposit",
  DECLINED:       "Declined",
  PAID:           "Paid",
  COMPLETED:      "Completed",
  CANCELLED:      "Cancelled",
  DISPUTED:       "Disputed",
  REFUNDED:       "Refunded",
  EXPIRED:        "Expired",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING_VENDOR: "bg-warning/10 text-warning border border-warning/30",
  ACCEPTED:       "bg-secondary/15 text-secondary",
  DECLINED:       "bg-muted/60 text-muted-foreground",
  PAID:           "bg-secondary/15 text-secondary",
  COMPLETED:      "bg-secondary/15 text-secondary",
  CANCELLED:      "bg-muted/60 text-muted-foreground",
  DISPUTED:       "bg-destructive/10 text-destructive border border-destructive/30",
  REFUNDED:       "bg-muted/60 text-muted-foreground",
  EXPIRED:        "bg-muted/60 text-muted-foreground",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CustomerBookingsPage() {
  const user = await findCurrentUser();
  if (!user) notFound();

  const bookings = await getCustomerBookings(user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          My bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your booking requests.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <Inbox
            className="mb-3 h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium text-foreground">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When you book a vendor, your requests will appear here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/vendors">Browse vendors</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.bookingCode} booking={booking} />
          ))}
        </div>
      )}
    </main>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({ booking }: { booking: CustomerBookingItem }) {
  const dateStr = booking.eventDate.toLocaleDateString("en-NG", {
    weekday: "short",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    timeZone: "Africa/Lagos",
  });

  const label = STATUS_LABEL[booking.status] ?? booking.status;
  const chipClass = STATUS_CLASS[booking.status] ?? "bg-muted/60 text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      {/* Header row: booking code + status chip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold text-foreground">
          {booking.bookingCode}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chipClass}`}
        >
          {label}
        </span>
      </div>

      {/* Service + vendor */}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{booking.serviceName}</p>
        <p className="text-muted-foreground">
          by{" "}
          <span className="font-medium text-foreground">{booking.vendorName}</span>
        </p>
      </div>

      {/* Event details */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {dateStr}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {booking.eventLocation}
        </span>
      </div>

      {/* Amounts */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">
          Total{" "}
          <span className="font-semibold text-foreground">
            {formatNaira(booking.totalAmountKobo)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Deposit{" "}
          <span className="font-medium text-primary">
            {formatNaira(booking.depositAmountKobo)}
          </span>
        </span>
      </div>

      {/* Pay deposit action — ACCEPTED only */}
      {booking.status === "ACCEPTED" && (
        <div className="flex justify-end border-t border-border pt-3">
          <Button asChild size="sm">
            <Link href={`/book/${booking.bookingCode}/pay`}>
              Pay deposit
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
