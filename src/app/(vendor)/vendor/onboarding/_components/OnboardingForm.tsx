"use client";

import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StepIndicator } from "@/components/StepIndicator";
import { Step1BusinessBasics, type Step1Values } from "./Step1BusinessBasics";
import { Step2LocationContact, type Step2Values } from "./Step2LocationContact";
import { Step3VerificationDocs, type Step3Values } from "./Step3VerificationDocs";
import { Step4BankDetails, type Step4Values } from "./Step4BankDetails";
import { submitOnboarding } from "../actions";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OnboardingPrefill {
  businessName?: string;
  bio?: string;
  yearsOfExperience?: string;
  primaryCategory?: string;
  address?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  cacNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

interface Props {
  prefill?: OnboardingPrefill;
  /** Admin rejection or info-request note, shown as a banner above the form. */
  adminNote?: string | null;
}

// ── State ──────────────────────────────────────────────────────────────────────

const STEPS = ["Business", "Location", "Documents", "Bank details"];

// ── Server-error routing helpers ───────────────────────────────────────────────

const STEP_FIELDS: [number, string[]][] = [
  [1, ["businessName", "bio", "yearsOfExperience", "primaryCategory"]],
  [2, ["address", "whatsappNumber", "instagramHandle"]],
  [3, ["cacNumber", "cacCertificate", "governmentId", "portfolioItems"]],
  [4, ["bankName", "bankAccountNumber", "bankAccountName"]],
];

/** Returns the lowest step number that contains an error key, defaulting to 4. */
function stepForFirstError(fieldErrors: Record<string, string[]>): number {
  for (const [step, fields] of STEP_FIELDS) {
    if (fields.some((f) => f in fieldErrors)) return step;
  }
  return 4;
}

/** Extracts single-message errors for a given set of field names. */
function extractStepErrors(
  fieldErrors: Record<string, string[]>,
  fields: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const msg = fieldErrors[f]?.[0];
    if (msg) out[f] = msg;
  }
  return out;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OnboardingForm({ prefill, adminNote }: Props) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [s1, setS1] = useState<Step1Values>({
    businessName:      prefill?.businessName      ?? "",
    bio:               prefill?.bio               ?? "",
    yearsOfExperience: prefill?.yearsOfExperience ?? "",
    primaryCategory:   prefill?.primaryCategory   ?? "",
  });

  const [s2, setS2] = useState<Step2Values>({
    address:         prefill?.address         ?? "",
    whatsappNumber:  prefill?.whatsappNumber  ?? "",
    instagramHandle: prefill?.instagramHandle ?? "",
  });

  // Files must always be re-uploaded on resubmit (no pre-fill from existing Cloudinary refs).
  const [s3, setS3] = useState<Step3Values>({
    cacNumber:      prefill?.cacNumber ?? "",
    cacCertificate: null,
    governmentId:   null,
    portfolioItems: [],
  });

  const [s4] = useState<Step4Values>({
    bankName:          prefill?.bankName          ?? "",
    bankAccountNumber: prefill?.bankAccountNumber ?? "",
    bankAccountName:   prefill?.bankAccountName   ?? "",
  });

  // Per-step server error state — set on VALIDATION_ERROR, consumed by each step on mount.
  const [s1ServerErrors, setS1ServerErrors] = useState<Record<string, string>>({});
  const [s2ServerErrors, setS2ServerErrors] = useState<Record<string, string>>({});
  const [s3ServerErrors, setS3ServerErrors] = useState<Record<string, string>>({});
  const [s4ServerErrors, setS4ServerErrors] = useState<Record<string, string>>({});
  // Incremented to force Step4 to re-mount when server errors target it.
  const [s4ResetKey, setS4ResetKey] = useState(0);

  function handleSubmit(step4Data: Step4Values) {
    const governmentId = s3.governmentId;
    if (!governmentId) {
      toast.error("Your government ID upload didn't complete. Please re-upload it.");
      setS3ServerErrors({ governmentId: "Your government ID upload didn't complete. Please re-upload it." });
      setStep(3);
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitOnboarding({
          businessName:      s1.businessName,
          bio:               s1.bio,
          yearsOfExperience: Number(s1.yearsOfExperience),
          primaryCategory:   s1.primaryCategory as "CATERING" | "DECORATION" | "PHOTOGRAPHY",
          address:           s2.address,
          whatsappNumber:    s2.whatsappNumber,
          instagramHandle:   s2.instagramHandle || undefined,
          cacNumber:         s3.cacNumber || undefined,
          cacCertificate:    s3.cacCertificate ?? undefined,
          governmentId,
          portfolioItems:    s3.portfolioItems,
          bankName:          step4Data.bankName,
          bankAccountNumber: step4Data.bankAccountNumber,
          bankAccountName:   step4Data.bankAccountName,
        });
        // Reached only when the action returned an error (redirect was NOT called).
        if (result.code === "AUTH_REQUIRED") {
          toast.error("Session expired — please sign in again.");
        } else if (result.code === "VALIDATION_ERROR") {
          const { fieldErrors } = result;
          const targetStep = stepForFirstError(fieldErrors);
          const stepErrors = extractStepErrors(fieldErrors, STEP_FIELDS[targetStep - 1][1]);
          if (targetStep === 1) setS1ServerErrors(stepErrors);
          else if (targetStep === 2) setS2ServerErrors(stepErrors);
          else if (targetStep === 3) setS3ServerErrors(stepErrors);
          else { setS4ServerErrors(stepErrors); setS4ResetKey((k) => k + 1); }
          setStep(targetStep);
          toast.error("Some fields are invalid. Please check the highlighted fields.");
        } else {
          toast.error(result.message ?? "Something went wrong. Please try again.");
        }
      } catch {
        // Unexpected exception (not the redirect thrown on success).
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-0">
      {/* Admin rejection / info-request banner */}
      {adminNote && (
        <div className="mb-6 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Action required from our review team
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{adminNote}</p>
          </div>
        </div>
      )}

      <StepIndicator steps={STEPS} current={step} />

      <div className="mt-8">
        {step === 1 && (
          <Step1BusinessBasics
            defaultValues={s1}
            serverErrors={s1ServerErrors}
            onNext={(data) => {
              setS1(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2LocationContact
            defaultValues={s2}
            serverErrors={s2ServerErrors}
            onBack={() => setStep(1)}
            onNext={(data) => {
              setS2(data);
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <Step3VerificationDocs
            defaultValues={s3}
            serverErrors={s3ServerErrors}
            onBack={() => setStep(2)}
            onNext={(data) => {
              setS3(data);
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <Step4BankDetails
            key={s4ResetKey}
            defaultValues={s4}
            serverErrors={s4ServerErrors}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}
