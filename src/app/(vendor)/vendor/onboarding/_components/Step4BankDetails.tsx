"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { step4Schema } from "@/lib/validators/vendor";
import { NIGERIAN_BANKS } from "@/lib/constants/nigerian-banks";

export interface Step4Values {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

interface Props {
  defaultValues: Step4Values;
  serverErrors?: Partial<Record<string, string>>;
  onBack: () => void;
  onSubmit: (data: Step4Values) => void;
  isPending: boolean;
}

type Errors = Partial<Record<keyof Step4Values, string>>;

export function Step4BankDetails({ defaultValues, serverErrors, onBack, onSubmit, isPending }: Props) {
  const [v, setV] = useState<Step4Values>(defaultValues);
  const [errors, setErrors] = useState<Errors>((serverErrors ?? {}) as Errors);

  function set<K extends keyof Step4Values>(key: K, value: Step4Values[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const result = step4Schema.safeParse(v);
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        bankName:          fe.bankName?.[0],
        bankAccountNumber: fe.bankAccountNumber?.[0],
        bankAccountName:   fe.bankAccountName?.[0],
      });
      return;
    }
    setErrors({});
    onSubmit(v);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Bank details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used for payouts once your bookings are completed. Kept secure and not shown publicly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Bank name */}
        <div className="space-y-1.5">
          <Label htmlFor="bankName">
            Bank{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Select value={v.bankName} onValueChange={(val) => set("bankName", val)}>
            <SelectTrigger id="bankName" aria-invalid={!!errors.bankName}>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_BANKS.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bankName && (
            <p className="text-sm text-destructive">{errors.bankName}</p>
          )}
        </div>

        {/* Account number */}
        <div className="space-y-1.5">
          <Label htmlFor="bankAccountNumber">
            Account number{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="bankAccountNumber"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={v.bankAccountNumber}
            onChange={(e) => set("bankAccountNumber", e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit account number"
            aria-invalid={!!errors.bankAccountNumber}
          />
          {errors.bankAccountNumber && (
            <p className="text-sm text-destructive">{errors.bankAccountNumber}</p>
          )}
        </div>

        {/* Account name */}
        <div className="space-y-1.5">
          <Label htmlFor="bankAccountName">
            Account name{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="bankAccountName"
            value={v.bankAccountName}
            onChange={(e) => set("bankAccountName", e.target.value)}
            placeholder="As it appears on your bank statement"
            aria-invalid={!!errors.bankAccountName}
          />
          {errors.bankAccountName && (
            <p className="text-sm text-destructive">{errors.bankAccountName}</p>
          )}
        </div>

        <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
          Bank details are used for payouts only. Paystack account verification will be added
          in a future update.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </div>
    </div>
  );
}
