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
import { step1Schema } from "@/lib/validators/vendor";

export interface Step1Values {
  businessName: string;
  bio: string;
  yearsOfExperience: string;
  primaryCategory: string;
}

interface Props {
  defaultValues: Step1Values;
  serverErrors?: Partial<Record<string, string>>;
  onNext: (data: Step1Values) => void;
}

type Errors = Partial<Record<keyof Step1Values, string>>;

export function Step1BusinessBasics({ defaultValues, serverErrors, onNext }: Props) {
  const [v, setV] = useState<Step1Values>(defaultValues);
  const [errors, setErrors] = useState<Errors>((serverErrors ?? {}) as Errors);

  function set<K extends keyof Step1Values>(key: K, value: Step1Values[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleNext() {
    const result = step1Schema.safeParse({
      ...v,
      yearsOfExperience: v.yearsOfExperience,
    });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        businessName:      fe.businessName?.[0],
        bio:               fe.bio?.[0],
        yearsOfExperience: fe.yearsOfExperience?.[0],
        primaryCategory:   fe.primaryCategory?.[0],
      });
      return;
    }
    setErrors({});
    onNext({
      businessName:      result.data.businessName,
      bio:               result.data.bio,
      yearsOfExperience: String(result.data.yearsOfExperience),
      primaryCategory:   result.data.primaryCategory,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Business basics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell customers what you do and who you are.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business name */}
        <div className="space-y-1.5">
          <Label htmlFor="businessName">
            Business name{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Input
            id="businessName"
            value={v.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="e.g. Folake's Kitchen"
            aria-invalid={!!errors.businessName}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">
            About your business{" "}
            <span className="text-primary" aria-hidden="true">*</span>
          </Label>
          <Textarea
            id="bio"
            value={v.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Describe your business, what you offer, and what makes you different. (200–1000 characters)"
            rows={5}
            aria-invalid={!!errors.bio}
          />
          <p className="text-right text-xs text-muted-foreground">
            {v.bio.length} / 1000
          </p>
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio}</p>
          )}
        </div>

        {/* Category + Years side by side on sm+ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="primaryCategory">
              Category{" "}
              <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Select
              value={v.primaryCategory}
              onValueChange={(val) => set("primaryCategory", val)}
            >
              <SelectTrigger
                id="primaryCategory"
                aria-invalid={!!errors.primaryCategory}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CATERING">Catering</SelectItem>
                <SelectItem value="DECORATION">Decoration</SelectItem>
                <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
              </SelectContent>
            </Select>
            {errors.primaryCategory && (
              <p className="text-sm text-destructive">{errors.primaryCategory}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearsOfExperience">
              Years of experience{" "}
              <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min={0}
              value={v.yearsOfExperience}
              onChange={(e) => set("yearsOfExperience", e.target.value)}
              placeholder="0"
              aria-invalid={!!errors.yearsOfExperience}
            />
            {errors.yearsOfExperience && (
              <p className="text-sm text-destructive">{errors.yearsOfExperience}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
