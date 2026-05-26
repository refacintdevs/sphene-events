"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setUserRole } from "../actions";

type RoleOption = "CUSTOMER" | "VENDOR";

interface CardConfig {
  role: RoleOption;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  ctaColor: string;
  hoverBorder: string;
}

const CARDS: CardConfig[] = [
  {
    role: "CUSTOMER",
    title: "I want to book vendors",
    description:
      "Find verified caterers, decorators, photographers and more for your events.",
    cta: "Continue as Customer",
    icon: <CalendarDays className="h-6 w-6" />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    ctaColor: "text-primary",
    hoverBorder: "hover:border-primary/30",
  },
  {
    role: "VENDOR",
    title: "I am a vendor",
    description:
      "Offer your services to event hosts across Nigeria. Get verified and start receiving bookings.",
    cta: "Continue as Vendor",
    icon: <Briefcase className="h-6 w-6" />,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    ctaColor: "text-secondary",
    hoverBorder: "hover:border-secondary/30",
  },
];

export function RoleCards() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingRole, setPendingRole] = useState<RoleOption | null>(null);

  function handleSelect(role: RoleOption) {
    if (isPending) return;
    setPendingRole(role);
    startTransition(async () => {
      try {
        const result = await setUserRole(role);
        // Only reached if redirect() was NOT called (i.e., an error was returned)
        setPendingRole(null);
        if (result.code === "AUTH_REQUIRED") {
          router.push("/sign-in");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch {
        // Unexpected server exception (not a redirect)
        setPendingRole(null);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {CARDS.map((card) => {
        const isActive = pendingRole === card.role;
        const isOther = isPending && pendingRole !== card.role;

        return (
          <button
            key={card.role}
            type="button"
            onClick={() => handleSelect(card.role)}
            disabled={isPending}
            aria-label={card.cta}
            className={cn(
              // Base layout
              "flex flex-col rounded-2xl border border-border bg-card p-6 text-left md:p-8",
              // Transitions and hover
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
              card.hoverBorder,
              // Focus ring (keyboard navigation)
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Loading states
              "disabled:cursor-not-allowed",
              isActive && "opacity-60",
              isOther && "opacity-40",
            )}
          >
            {/* Icon badge */}
            <div
              className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                card.iconBg,
                card.iconColor,
              )}
            >
              {card.icon}
            </div>

            {/* Text content */}
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">
              {card.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {card.description}
            </p>

            {/* CTA row */}
            <div
              className={cn(
                "mt-6 flex items-center justify-end text-sm font-semibold",
                card.ctaColor,
              )}
            >
              {isActive ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up…
                </>
              ) : (
                <>
                  {card.cta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
