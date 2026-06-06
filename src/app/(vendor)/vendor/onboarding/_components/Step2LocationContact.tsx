"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { step2Schema } from "@/lib/validators/vendor";

export interface Step2Values {
  address: string;
  whatsappNumber: string;
  instagramHandle: string;
}

interface Props {
  defaultValues: Step2Values;
  serverErrors?: Partial<Record<string, string>>;
  onBack: () => void;
  onNext: (data: Step2Values) => void;
}

type Errors = Partial<Record<keyof Step2Values, string>>;

export function Step2LocationContact({ defaultValues, serverErrors, onBack, onNext }: Props) {
  const [v, setV] = useState<Step2Values>(defaultValues);
  const [errors, setErrors] = useState<Errors>((serverErrors ?? {}) as Errors);

  function set<K extends keyof Step2Values>(key: K, value: Step2Values[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleNext() {
    const result = step2Schema.safeParse(v);
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        address:         fe.address?.[0],
        whatsappNumber:  fe.whatsappNumber?.[0],
        instagramHandle: fe.instagramHandle?.[0],
      });
      return;
    }
    setErrors({});
    onNext({
      address:         result.data.address,
      whatsappNumber:  result.data.whatsappNumber, // normalised to +234
      instagramHandle: result.data.instagramHandle ?? "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Location &amp; contact
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where you operate and how customers can reach you after booking.
        </p>
      </div>

      <div className="space-y-4">
        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address">
            Address{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Textarea
            id="address"
            value={v.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="e.g. 22 Allen Avenue, Ikeja, Lagos"
            rows={2}
            aria-invalid={!!errors.address}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        {/* State — fixed Lagos, disabled */}
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Select value="LAGOS" disabled>
            <SelectTrigger id="state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LAGOS">Lagos</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            EventIQ operates in Lagos only for the MVP launch.
          </p>
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">
            WhatsApp number{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={v.whatsappNumber}
            onChange={(e) => set("whatsappNumber", e.target.value)}
            placeholder="08012345678 or +2348012345678"
            aria-invalid={!!errors.whatsappNumber}
          />
          <p className="text-xs text-muted-foreground">
            Revealed to customers only after they pay a deposit.
          </p>
          {errors.whatsappNumber && (
            <p className="text-sm text-destructive">{errors.whatsappNumber}</p>
          )}
        </div>

        {/* Instagram — optional */}
        <div className="space-y-1.5">
          <Label htmlFor="instagramHandle">Instagram handle</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              @
            </span>
            <Input
              id="instagramHandle"
              value={v.instagramHandle}
              onChange={(e) => set("instagramHandle", e.target.value)}
              placeholder="yourbusiness"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">Optional — strong trust signal for customers.</p>
        </div>
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
