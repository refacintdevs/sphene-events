"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AuthError, NotFoundError, BookingValidationError } from "@/lib/errors";
import { bookingRequestSchema } from "@/lib/validators/booking";
import { createBookingRequest } from "@/services/booking";

// ── Return type (error path only) ─────────────────────────────────────────────

type BookingError =
  | { ok: false; code: "AUTH_REQUIRED" }
  | { ok: false; code: "VALIDATION_ERROR"; fieldErrors?: Record<string, string[]> }
  | { ok: false; code: "SERVICE_UNAVAILABLE"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string };

/**
 * Creates a booking request for the authenticated customer.
 *
 * Only returns on the error path — success exits via redirect() which throws
 * NEXT_REDIRECT. The redirect() call is therefore OUTSIDE every try/catch block
 * to ensure NEXT_REDIRECT propagates freely (BUG-002 family: catching it silently
 * breaks the redirect and the success path appears to do nothing).
 *
 * @param serviceId  - From the URL path param. Re-validated server-side via DB lookup.
 * @param rawData    - Raw form values from the client. Never trusted until parsed by Zod.
 */
export async function submitBookingRequest(
  serviceId: string,
  rawData: unknown,
): Promise<BookingError> {
  // ── 1. Authenticate and check CUSTOMER role ───────────────────────────────
  // requireRole calls getCurrentUser() (ensureUser inside) then checks role.
  // customerId must come from the server-authenticated DB user — never from client.
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("CUSTOMER");
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, code: "AUTH_REQUIRED" };
    console.error("[submitBookingRequest] auth error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Authentication error. Please try again." };
  }

  // ── 2. Validate user input ────────────────────────────────────────────────
  const parsed = bookingRequestSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // ── 3. Create booking via service ─────────────────────────────────────────
  // customerId = server-authenticated user.id (invariant 6 — auth before mutation).
  let bookingCode: string;
  try {
    const result = await createBookingRequest({
      serviceId,
      customerId:      user.id,
      eventDate:       parsed.data.eventDate,
      eventLocation:   parsed.data.eventLocation,
      guestCount:      parsed.data.guestCount,
      specialRequests: parsed.data.specialRequests,
    });
    bookingCode = result.bookingCode;
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { ok: false, code: "SERVICE_UNAVAILABLE", message: err.message };
    }
    if (err instanceof BookingValidationError) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        fieldErrors: { eventDate: [err.message] },
      };
    }
    console.error("[submitBookingRequest] DB error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Failed to create booking. Please try again." };
  }

  // ── 4. Redirect on success ────────────────────────────────────────────────
  // MUST be outside every try/catch — redirect() throws NEXT_REDIRECT which
  // Next.js intercepts as navigation control flow. (see BUG-002 in bug-log.md)
  redirect(`/book/confirmed/${bookingCode}`);
}
