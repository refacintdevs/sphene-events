import type { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { NotFoundError, BookingValidationError } from "@/lib/errors";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceForBooking {
  id: string;
  title: string;
  priceKobo: number;
  durationHours: number | null;
  isActive: boolean;
  vendor: {
    id: string;           // VendorProfile.id — written to Booking.vendorId
    businessName: string;
    slug: string;
    verificationStatus: string;
    whatsappNumber: string;
  };
}

export interface BookingRequestInput {
  serviceId: string;
  customerId: string;  // DB User.id — sourced from server auth, never from client
  eventDate: Date;
  eventLocation: string;
  guestCount?: number;
  specialRequests?: string;
}

export interface VendorBookingItem {
  bookingCode: string;
  status: BookingStatus;
  eventDate: Date;
  eventLocation: string;
  totalAmountKobo: number;
  depositAmountKobo: number;
  serviceName: string;
  customerName: string;
  createdAt: Date;
}

export interface BookingConfirmation {
  bookingCode: string;
  vendorName: string;
  serviceName: string;
  eventDate: Date;
  eventLocation: string;
  totalAmountKobo: number;
  depositAmountKobo: number;
  balanceAmountKobo: number;
}

// ── Read functions ────────────────────────────────────────────────────────────

export async function getServiceForBooking(
  serviceId: string,
): Promise<ServiceForBooking | null> {
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      title: true,
      priceKobo: true,
      durationHours: true,
      isActive: true,
      vendor: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          verificationStatus: true,
          whatsappNumber: true,
        },
      },
    },
  });
  if (!service || !service.isActive) return null;
  return service;
}

export async function getBookingConfirmation(
  bookingCode: string,
  customerId: string,
): Promise<BookingConfirmation | null> {
  const booking = await db.booking.findUnique({
    where: { bookingCode },
    select: {
      customerId: true,
      totalAmountKobo: true,
      depositAmountKobo: true,
      balanceAmountKobo: true,
      eventDate: true,
      eventLocation: true,
      service: {
        select: {
          title: true,
          vendor: { select: { businessName: true } },
        },
      },
    },
  });
  if (!booking || booking.customerId !== customerId) return null;
  return {
    bookingCode,
    vendorName: booking.service.vendor.businessName,
    serviceName: booking.service.title,
    eventDate: booking.eventDate,
    eventLocation: booking.eventLocation,
    totalAmountKobo: booking.totalAmountKobo,
    depositAmountKobo: booking.depositAmountKobo,
    balanceAmountKobo: booking.balanceAmountKobo,
  };
}

// ── Vendor-facing read functions ──────────────────────────────────────────────

/** Minimal lookup: returns only the VendorProfile.id for the given User.id. */
export async function getVendorProfileId(
  userId: string,
): Promise<{ id: string } | null> {
  return db.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

/** All bookings owned by this vendor, newest first. */
export async function getVendorBookings(
  vendorProfileId: string,
): Promise<VendorBookingItem[]> {
  const rows = await db.booking.findMany({
    where: { vendorId: vendorProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      bookingCode:       true,
      status:            true,
      eventDate:         true,
      eventLocation:     true,
      totalAmountKobo:   true,
      depositAmountKobo: true,
      createdAt:         true,
      service:  { select: { title: true } },
      customer: { select: { fullName: true } },
    },
  });
  return rows.map((r) => ({
    bookingCode:       r.bookingCode,
    status:            r.status,
    eventDate:         r.eventDate,
    eventLocation:     r.eventLocation,
    totalAmountKobo:   r.totalAmountKobo,
    depositAmountKobo: r.depositAmountKobo,
    serviceName:       r.service.title,
    customerName:      r.customer.fullName,
    createdAt:         r.createdAt,
  }));
}

// ── State-transition functions ─────────────────────────────────────────────────

/**
 * Transitions a PENDING_VENDOR booking to ACCEPTED.
 *
 * Steps:
 *  1. Fetch booking for ownership check and email stub data.
 *  2. Ownership: if not found or vendorId mismatch → NotFoundError.
 *  3. Status guard (quick early exit): if not PENDING_VENDOR → BookingValidationError.
 *  4. Atomic conditional update (WHERE includes all three conditions). If count === 0,
 *     the booking was already acted on between steps 3 and 4 (double-click / two tabs)
 *     → BookingValidationError. This makes the status guard race-safe.
 *  5. Email stub — only reached on a successful update.
 */
export async function acceptBooking(
  bookingCode: string,
  vendorProfileId: string,
): Promise<void> {
  const booking = await db.booking.findUnique({
    where: { bookingCode },
    select: {
      vendorId: true,
      status:   true,
      customer: { select: { email: true } },
    },
  });

  if (!booking || booking.vendorId !== vendorProfileId) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status !== "PENDING_VENDOR") {
    throw new BookingValidationError("This booking can no longer be accepted");
  }

  const result = await db.booking.updateMany({
    where: { bookingCode, vendorId: vendorProfileId, status: "PENDING_VENDOR" },
    data:  { status: "ACCEPTED", vendorRespondedAt: new Date() },
  });

  if (result.count === 0) {
    throw new BookingValidationError("This booking can no longer be accepted");
  }

  console.log(
    `[EMAIL STUB] booking-accepted → customer (${booking.customer.email}), booking ${bookingCode} // TODO(Week 3): Resend`,
  );
}

/**
 * Transitions a PENDING_VENDOR booking to DECLINED.
 * Same atomicity pattern as acceptBooking.
 */
export async function declineBooking(
  bookingCode: string,
  vendorProfileId: string,
): Promise<void> {
  const booking = await db.booking.findUnique({
    where: { bookingCode },
    select: {
      vendorId: true,
      status:   true,
      customer: { select: { email: true } },
    },
  });

  if (!booking || booking.vendorId !== vendorProfileId) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status !== "PENDING_VENDOR") {
    throw new BookingValidationError("This booking can no longer be declined");
  }

  const result = await db.booking.updateMany({
    where: { bookingCode, vendorId: vendorProfileId, status: "PENDING_VENDOR" },
    data:  { status: "DECLINED", vendorRespondedAt: new Date() },
  });

  if (result.count === 0) {
    throw new BookingValidationError("This booking can no longer be declined");
  }

  console.log(
    `[EMAIL STUB] booking-declined → customer (${booking.customer.email}), booking ${bookingCode} // TODO(Week 3): Resend`,
  );
}

// ── Write functions ───────────────────────────────────────────────────────────

/**
 * Sequential booking code: SE-YYYY-NNNN.
 * Race condition possible at high concurrency — the @unique constraint on
 * bookingCode is the safety net (P2002 on collision).
 */
async function generateBookingCode(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await db.booking.findFirst({
    where: { bookingCode: { startsWith: `SE-${year}-` } },
    orderBy: { bookingCode: "desc" },
    select: { bookingCode: true },
  });
  let nextNum = 1;
  if (last) {
    const tail = last.bookingCode.split("-")[2];
    nextNum = parseInt(tail ?? "0", 10) + 1;
  }
  return `SE-${year}-${String(nextNum).padStart(4, "0")}`;
}

/** Strips time from a Date for calendar-day comparisons (UTC). */
function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function createBookingRequest(
  input: BookingRequestInput,
): Promise<{ bookingCode: string }> {
  // Re-fetch service server-side (invariant 2 — prices never trusted from client).
  const service = await getServiceForBooking(input.serviceId);
  if (!service) throw new NotFoundError("Service not found or no longer available");
  if (service.vendor.verificationStatus !== "APPROVED") {
    throw new NotFoundError("Vendor is not available for booking");
  }

  // Defensive date re-validation at day granularity (mirrors Zod schema).
  const todayUtc = toDateOnly(new Date());
  const submittedUtc = toDateOnly(input.eventDate);
  const maxDateUtc = toDateOnly(
    new Date(new Date().setMonth(new Date().getMonth() + 18)),
  );
  if (submittedUtc < todayUtc) {
    throw new BookingValidationError("Event date cannot be in the past");
  }
  if (submittedUtc > maxDateUtc) {
    throw new BookingValidationError("Event date must be within 18 months from today");
  }

  // Price snapshot — computed server-side only (invariant 2).
  const totalAmountKobo = service.priceKobo;
  const depositAmountKobo = Math.round(totalAmountKobo * 0.3);
  const balanceAmountKobo = totalAmountKobo - depositAmountKobo;

  const bookingCode = await generateBookingCode();

  await db.booking.create({
    data: {
      bookingCode,
      customerId:        input.customerId,
      vendorId:          service.vendor.id,  // VendorProfile.id, not User.id
      serviceId:         input.serviceId,
      eventDate:         input.eventDate,
      eventLocation:     input.eventLocation,
      guestCount:        input.guestCount ?? null,
      specialRequests:   input.specialRequests || null,
      totalAmountKobo,
      depositAmountKobo,
      balanceAmountKobo,
      status:            "PENDING_VENDOR",
      whatsappRevealed:  false,
    },
  });

  console.log(
    `[EMAIL STUB] booking-new-request → vendor (${service.vendor.businessName}), booking ${bookingCode} // TODO(Week 3): Resend`,
  );

  return { bookingCode };
}
