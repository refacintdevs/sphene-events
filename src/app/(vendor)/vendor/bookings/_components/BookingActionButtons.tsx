"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptBooking, declineBooking } from "../actions";

interface Props {
  bookingCode: string;
}

export function BookingActionButtons({ bookingCode }: Props) {
  const [isAccepting, startAccept] = useTransition();
  const [isDeclining, startDecline] = useTransition();

  const isPending = isAccepting || isDeclining;

  function handleAccept() {
    startAccept(async () => {
      try {
        const result = await acceptBooking(bookingCode);
        
        // Only reached on error — success exits via redirect() in the action.
        if (result.code === "AUTH_REQUIRED") {
          toast.error("Session expired — please sign in again.");
        } else {
          toast.error(result.message ?? "Failed to accept booking. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function handleDecline() {
    startDecline(async () => {
      try {
        const result = await declineBooking(bookingCode);
        if (result.code === "AUTH_REQUIRED") {
          toast.error("Session expired — please sign in again.");
        } else {
          toast.error(result.message ?? "Failed to decline booking. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        onClick={handleAccept}
        disabled={isPending}
      >
        {isAccepting ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Accepting…
          </>
        ) : (
          "Accept"
        )}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleDecline}
        disabled={isPending}
      >
        {isDeclining ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Declining…
          </>
        ) : (
          "Decline"
        )}
      </Button>
    </div>
  );
}
