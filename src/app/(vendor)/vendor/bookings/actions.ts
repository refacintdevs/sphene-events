"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AuthError, NotFoundError, BookingValidationError } from "@/lib/errors";
import {
  getVendorProfileId,
  acceptBooking as acceptBookingService,
  declineBooking as declineBookingService,
} from "@/services/booking";

// ── Return type (error path only) ─────────────────────────────────────────────

type BookingActionError =
  | { ok: false; code: "AUTH_REQUIRED" }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "INVALID_STATUS"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string };

// ── Shared auth + profile helper ──────────────────────────────────────────────

async function getAuthenticatedVendorProfileId(): Promise<
  | { ok: true; vendorProfileId: string }
  | BookingActionError
> {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("VENDOR");
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, code: "AUTH_REQUIRED" };
    console.error("[vendorBookingAction] auth error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Authentication error. Please try again." };
  }

  const profile = await getVendorProfileId(user.id);
  if (!profile) {
    return { ok: false, code: "NOT_FOUND", message: "Vendor profile not found." };
  }

  return { ok: true, vendorProfileId: profile.id };
}

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Accepts a PENDING_VENDOR booking on behalf of the authenticated vendor.
 *
 * Only returns on the error path — success exits via redirect() which throws
 * NEXT_REDIRECT. The redirect() call is therefore OUTSIDE every try/catch block
 * to ensure NEXT_REDIRECT propagates freely (BUG-002 family).
 *
 * No Zod validation step — bookingCode is a server-supplied path string, and
 * all ownership + status checks are enforced in the service layer.
 */
export async function acceptBooking(bookingCode: string): Promise<BookingActionError> {
  const auth = await getAuthenticatedVendorProfileId();
  if (!auth.ok) return auth;

  try {
    await acceptBookingService(bookingCode, auth.vendorProfileId);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { ok: false, code: "NOT_FOUND", message: err.message };
    }
    if (err instanceof BookingValidationError) {
      return { ok: false, code: "INVALID_STATUS", message: err.message };
    }
    console.error("[acceptBooking] error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Failed to accept booking. Please try again." };
  }

  // MUST be outside every try/catch — NEXT_REDIRECT must not be caught (BUG-002).
  redirect("/vendor/bookings");
}

/**
 * Declines a PENDING_VENDOR booking on behalf of the authenticated vendor.
 * Same pattern as acceptBooking.
 */
export async function declineBooking(bookingCode: string): Promise<BookingActionError> {
  const auth = await getAuthenticatedVendorProfileId();
  if (!auth.ok) return auth;

  try {
    await declineBookingService(bookingCode, auth.vendorProfileId);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { ok: false, code: "NOT_FOUND", message: err.message };
    }
    if (err instanceof BookingValidationError) {
      return { ok: false, code: "INVALID_STATUS", message: err.message };
    }
    console.error("[declineBooking] error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Failed to decline booking. Please try again." };
  }

  redirect("/vendor/bookings");
}
