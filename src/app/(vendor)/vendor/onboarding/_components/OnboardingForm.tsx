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

type AllValues = Step1Values & Step2Values & Step3Values & Step4Values;

const STEPS = ["Business", "Location", "Documents", "Bank details"];

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

  const [s4, setS4] = useState<Step4Values>({
    bankName:          prefill?.bankName          ?? "",
    bankAccountNumber: prefill?.bankAccountNumber ?? "",
    bankAccountName:   prefill?.bankAccountName   ?? "",
  });

  function handleSubmit() {
    // governmentId is validated in Step 3; by the time we reach Step 4 it is non-null.
    // Capture before entering the async transition to satisfy TypeScript narrowing.
    const governmentId = s3.governmentId;
    if (!governmentId) return;

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
          bankName:          s4.bankName,
          bankAccountNumber: s4.bankAccountNumber,
          bankAccountName:   s4.bankAccountName,
        });
        // Reached only when the action returned an error (redirect was NOT called).
        if (result.code === "AUTH_REQUIRED") {
          toast.error("Session expired — please sign in again.");
        } else if (result.code === "VALIDATION_ERROR") {
          toast.error("Some fields are invalid. Please go back and check your answers.");
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
            onNext={(data) => {
              setS1(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2LocationContact
            defaultValues={s2}
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
            onBack={() => setStep(2)}
            onNext={(data) => {
              setS3(data);
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <Step4BankDetails
            defaultValues={s4}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}
