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
