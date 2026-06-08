import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Inbox } from "lucide-react";
import { findCurrentUser } from "@/lib/auth";
import { getVendorProfileId, getVendorBookings } from "@/services/booking";
import { formatNaira } from "@/lib/format";
import type { VendorBookingItem } from "@/services/booking";
import { BookingActionButtons } from "./_components/BookingActionButtons";

export const metadata: Metadata = { title: "Booking Requests — EventIQ" };

// ── Status chip ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING_VENDOR: "Pending your response",
  ACCEPTED:       "Accepted",
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

export default async function VendorBookingsPage() {
  const user = await findCurrentUser();
  if (!user) notFound();

  const profile = await getVendorProfileId(user.id);
  if (!profile) notFound();

  const bookings = await getVendorBookings(profile.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Booking requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept or decline incoming booking requests from customers.
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
            Booking requests from customers will appear here.
          </p>
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

function BookingCard({ booking }: { booking: VendorBookingItem }) {
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
      {/* Header row: code + status chip */}
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

      {/* Service + customer */}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{booking.serviceName}</p>
        <p className="text-muted-foreground">
          Requested by <span className="font-medium text-foreground">{booking.customerName}</span>
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

      {/* Action buttons — PENDING_VENDOR only */}
      {booking.status === "PENDING_VENDOR" && (
        <div className="flex justify-end border-t border-border pt-3">
          <BookingActionButtons bookingCode={booking.bookingCode} />
        </div>
      )}
    </div>
  );
}
