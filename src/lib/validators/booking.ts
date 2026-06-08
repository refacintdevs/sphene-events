import { z } from "zod";

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Strips time from a Date so comparisons are at calendar-day granularity (UTC). */
function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// ── Schema ────────────────────────────────────────────────────────────────────

export const bookingRequestSchema = z.object({
  /**
   * ISO date string from <input type="date">. z.coerce.date() converts
   * "YYYY-MM-DD" → UTC midnight Date. Refinements compare at day granularity
   * to avoid UTC-vs-WAT edge cases (WAT = UTC+1, 1-hour drift window at midnight).
   */
  eventDate: z.coerce
    .date()
    .refine(
      (d) => toDateOnly(d) >= toDateOnly(new Date()),
      { message: "Event date cannot be in the past" },
    )
    .refine(
      (d) => {
        const max = new Date();
        max.setMonth(max.getMonth() + 18);
        return toDateOnly(d) <= toDateOnly(max);
      },
      { message: "Event date must be within 18 months from today" },
    ),

  eventLocation: z
    .string()
    .trim()
    .min(5, "Location must be at least 5 characters")
    .max(300, "Location must be 300 characters or fewer"),

  /**
   * Optional integer. z.preprocess converts empty string / NaN (from a
   * blank <input type="number" valueAsNumber>) to undefined before validation.
   */
  guestCount: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      if (typeof v === "number" && isNaN(v)) return undefined;
      return v;
    },
    z
      .number({ error: "Must be a valid number" })
      .int("Must be a whole number")
      .min(1, "Must be at least 1")
      .max(10_000, "Must be 10,000 or fewer")
      .optional(),
  ),

  specialRequests: z
    .string()
    .trim()
    .max(1_000, "Special requests must be 1,000 characters or fewer")
    .optional(),
});

/** Output type after Zod transformation (what the service receives). */
export type BookingRequestValues = z.output<typeof bookingRequestSchema>;

/**
 * Input type before Zod transformation (what the HTML form fields produce).
 * Used as the first generic parameter of useForm<Input, Context, Output> so
 * that zodResolver's input/output types match react-hook-form's expectations.
 * z.coerce / z.preprocess produce `unknown` input types, which causes a type
 * error if you use useForm<BookingRequestValues> directly.
 */
export type BookingFormRawValues = z.input<typeof bookingRequestSchema>;
