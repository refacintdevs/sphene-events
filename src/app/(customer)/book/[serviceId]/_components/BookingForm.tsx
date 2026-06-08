"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/format";
import {
  bookingRequestSchema,
  type BookingRequestValues,
  type BookingFormRawValues,
} from "@/lib/validators/booking";
import { submitBookingRequest } from "../actions";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  serviceId: string;
  serviceName: string;
  vendorName: string;
  totalAmountKobo: number;
  depositAmountKobo: number;
  balanceAmountKobo: number;
  /** YYYY-MM-DD string for <input type="date" min=…> (today, UTC). */
  minDate: string;
  /** YYYY-MM-DD string for <input type="date" max=…> (18 months out, UTC). */
  maxDate: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BookingForm({
  serviceId,
  serviceName,
  vendorName,
  totalAmountKobo,
  depositAmountKobo,
  balanceAmountKobo,
  minDate,
  maxDate,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();
  // Validated form values captured when the user advances to the review step.
  const [reviewValues, setReviewValues] = useState<BookingRequestValues | null>(null);

  // Three-param useForm: <RawFieldValues, Context, TransformedValues>.
  // Required because z.coerce / z.preprocess produce `unknown` Zod input types,
  // which conflict with useForm<BookingRequestValues> (output type). The resolver
  // maps BookingFormRawValues → BookingRequestValues via Zod transformation.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormRawValues, unknown, BookingRequestValues>({
    resolver: zodResolver(bookingRequestSchema),
  });

  // Step 1 → 2: validate with Zod, then show review.
  function handleReview() {
    handleSubmit((data) => {
      setReviewValues(data);
      setStep(2);
    })();
  }

  // Step 2: submit to Server Action.
  function handleConfirm() {
    if (!reviewValues) return;
    startTransition(async () => {
      try {
        const result = await submitBookingRequest(serviceId, reviewValues);
        // Only reached on error — success exits via redirect() in the action.
        if (result.code === "AUTH_REQUIRED") {
          toast.error("Session expired — please sign in again.");
        } else if (result.code === "SERVICE_UNAVAILABLE") {
          toast.error(result.message ?? "This service is no longer available.");
          setStep(1);
        } else if (result.code === "VALIDATION_ERROR") {
          toast.error("Some details couldn't be processed. Please go back and check.");
          setStep(1);
        } else {
          toast.error(result.message ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  // ── Step 2: read-only review ──────────────────────────────────────────────

  if (step === 2 && reviewValues) {
    const dateStr = reviewValues.eventDate.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Africa/Lagos",
    });

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Review your request</h2>

          <dl className="space-y-3 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium text-foreground">{serviceName}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Vendor</dt>
              <dd className="text-foreground">{vendorName}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Event date</dt>
              <dd className="text-foreground">{dateStr}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-foreground">{reviewValues.eventLocation}</dd>
            </div>
            {reviewValues.guestCount && (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-muted-foreground">Guests</dt>
                <dd className="text-foreground">{reviewValues.guestCount.toLocaleString("en-NG")}</dd>
              </div>
            )}
            {reviewValues.specialRequests && (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-muted-foreground">Requests</dt>
                <dd className="whitespace-pre-line text-foreground">
                  {reviewValues.specialRequests}
                </dd>
              </div>
            )}
          </dl>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">
                {formatNaira(totalAmountKobo)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deposit due on acceptance (30%)</span>
              <span className="font-medium text-primary">
                {formatNaira(depositAmountKobo)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Balance after event</span>
              <span className="text-foreground">{formatNaira(balanceAmountKobo)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By confirming, you send a booking request to the vendor. No payment is
          taken now — the deposit is due once the vendor accepts.
        </p>

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            disabled={isPending}
          >
            Back to edit
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Confirm request"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 1: event details form ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Event date */}
        <div className="space-y-1.5">
          <Label htmlFor="eventDate">
            Event date{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="eventDate"
            type="date"
            min={minDate}
            max={maxDate}
            {...register("eventDate")}
            aria-invalid={!!errors.eventDate}
          />
          {errors.eventDate && (
            <p className="text-sm text-destructive">{errors.eventDate.message}</p>
          )}
        </div>

        {/* Event location */}
        <div className="space-y-1.5">
          <Label htmlFor="eventLocation">
            Event location{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="eventLocation"
            placeholder="e.g. 12 Balogun Street, Victoria Island, Lagos"
            {...register("eventLocation")}
            aria-invalid={!!errors.eventLocation}
          />
          {errors.eventLocation && (
            <p className="text-sm text-destructive">{errors.eventLocation.message}</p>
          )}
        </div>

        {/* Guest count */}
        <div className="space-y-1.5">
          <Label htmlFor="guestCount">
            Guest count{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={10000}
            placeholder="e.g. 150"
            {...register("guestCount", { valueAsNumber: true })}
            aria-invalid={!!errors.guestCount}
          />
          {errors.guestCount && (
            <p className="text-sm text-destructive">{errors.guestCount.message}</p>
          )}
        </div>

        {/* Special requests */}
        <div className="space-y-1.5">
          <Label htmlFor="specialRequests">
            Special requests{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="specialRequests"
            rows={4}
            placeholder="Any dietary requirements, specific setup needs, or other details the vendor should know…"
            {...register("specialRequests")}
          />
          {errors.specialRequests && (
            <p className="text-sm text-destructive">
              {errors.specialRequests.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleReview}>
          Review booking
        </Button>
      </div>
    </div>
  );
}
