"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload, MultiFileUpload } from "./FileUpload";
import { step3Schema, type UploadedFile } from "@/lib/validators/vendor";

const VERIFICATION_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_VERIFICATION_PRESET ?? "eventiq_unsigned";
const PORTFOLIO_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_PORTFOLIO_PRESET ?? "eventiq_unsigned";

export interface Step3Values {
  cacNumber: string;
  cacCertificate: UploadedFile | null;
  governmentId: UploadedFile | null;
  portfolioItems: UploadedFile[];
}

interface Props {
  defaultValues: Step3Values;
  onBack: () => void;
  onNext: (data: Step3Values) => void;
}

type Errors = Partial<{
  cacNumber: string;
  cacCertificate: string;
  governmentId: string;
  portfolioItems: string;
}>;

export function Step3VerificationDocs({ defaultValues, onBack, onNext }: Props) {
  const [v, setV] = useState<Step3Values>(defaultValues);
  const [errors, setErrors] = useState<Errors>({});

  function handleNext() {
    const result = step3Schema.safeParse({
      cacNumber:       v.cacNumber || undefined,
      cacCertificate:  v.cacCertificate,
      governmentId:    v.governmentId,
      portfolioItems:  v.portfolioItems,
    });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        cacNumber:      fe.cacNumber?.[0],
        cacCertificate: fe.cacCertificate?.[0],
        governmentId:   fe.governmentId?.[0] ?? (!v.governmentId ? "Government ID is required" : undefined),
        portfolioItems: fe.portfolioItems?.[0],
      });
      return;
    }
    setErrors({});
    onNext({
      cacNumber:      v.cacNumber,
      cacCertificate: v.cacCertificate,
      governmentId:   v.governmentId,
      portfolioItems: v.portfolioItems,
    });
  }

  const cacFilled = v.cacNumber.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Verification documents
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These help our team verify your business. Documents are reviewed by EventIQ staff
          only and are not shown publicly.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── CAC section (optional) ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              CAC registration{" "}
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Vendors with CAC registration get a &ldquo;Verified Business&rdquo; badge instead of
              &ldquo;Verified Individual&rdquo;.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cacNumber">CAC number</Label>
            <Input
              id="cacNumber"
              value={v.cacNumber}
              onChange={(e) => {
                setV((prev) => ({ ...prev, cacNumber: e.target.value }));
                setErrors((err) => ({ ...err, cacNumber: undefined }));
              }}
              placeholder="RC1234567 or BN12345"
              aria-invalid={!!errors.cacNumber}
            />
            {errors.cacNumber && (
              <p className="text-sm text-destructive">{errors.cacNumber}</p>
            )}
          </div>

          <FileUpload
            label="CAC certificate"
            accept="image-or-pdf"
            preset={VERIFICATION_PRESET}
            value={v.cacCertificate}
            onChange={(file) => setV((prev) => ({ ...prev, cacCertificate: file }))}
            error={errors.cacCertificate}
            hint={
              cacFilled
                ? "Recommended — upload your CAC certificate to strengthen your application."
                : undefined
            }
          />
        </div>

        {/* ── Government ID (required) ───────────────────────────────────── */}
        <FileUpload
          label="Government-issued ID"
          required
          accept="image-or-pdf"
          preset={VERIFICATION_PRESET}
          value={v.governmentId}
          onChange={(file) => {
            setV((prev) => ({ ...prev, governmentId: file }));
            setErrors((err) => ({ ...err, governmentId: undefined }));
          }}
          error={errors.governmentId}
          hint="National ID, voter's card, driver's licence, or international passport."
        />

        {/* ── Portfolio (3–5 required) ───────────────────────────────────── */}
        <MultiFileUpload
          label="Portfolio samples"
          required
          min={3}
          max={5}
          preset={PORTFOLIO_PRESET}
          value={v.portfolioItems}
          onChange={(files) => {
            setV((prev) => ({ ...prev, portfolioItems: files }));
            setErrors((err) => ({ ...err, portfolioItems: undefined }));
          }}
          error={errors.portfolioItems}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          These will appear on your public profile page once your account is approved.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
