"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  /** Labels for each step. Length determines the step count. */
  steps: string[];
  /** 1-indexed current step number. */
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const progress = ((current - 1) / (steps.length - 1)) * 100;

  return (
    <nav aria-label="Onboarding progress">
      {/* Connector track + progress fill */}
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
        {/* Filled portion — width grows with current step */}
        <div
          className="absolute left-0 top-4 h-0.5 bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div
              key={label}
              className="relative flex flex-1 flex-col items-center last:flex-none"
            >
              <div
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-semibold transition-colors duration-200",
                  done && "bg-primary text-primary-foreground",
                  active &&
                    "border-2 border-primary text-primary ring-4 ring-primary/10",
                  !done && !active && "border-2 border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-xs font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
