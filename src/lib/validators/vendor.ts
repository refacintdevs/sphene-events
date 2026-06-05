import { z } from "zod";
import { NIGERIAN_BANKS } from "@/lib/constants/nigerian-banks";

// ── Phone ──────────────────────────────────────────────────────────────────────

const NIGERIAN_PHONE_RE = /^(\+234|0)[789][01]\d{8}$/;

/** Converts 08012345678 → +2348012345678. Returns input unchanged if already normalised. */
export function normalizeNigerianPhone(input: string): string {
  if (input.startsWith("+234")) return input;
  if (input.startsWith("0")) return "+234" + input.slice(1);
  return input;
}

export const nigerianPhoneSchema = z
  .string()
  .regex(NIGERIAN_PHONE_RE, "Invalid Nigerian phone number (e.g. 08012345678)")
  .transform(normalizeNigerianPhone);

// ── CAC ───────────────────────────────────────────────────────────────────────

const CAC_RE = /^(RC|BN)\d{4,9}$/i;

/** Optional CAC number: empty string is treated as absent; present values are uppercased. */
export const cacNumberSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || CAC_RE.test(v), {
    message: "Invalid CAC format (e.g. RC1234567 or BN12345)",
  })
  .transform((v) => (v === "" ? undefined : v.toUpperCase()))
  .optional();

// ── Bank account ───────────────────────────────────────────────────────────────

export const bankAccountNumberSchema = z
  .string()
  .regex(/^\d{10}$/, "Account number must be exactly 10 digits");

// ── Uploaded-file reference ────────────────────────────────────────────────────

export const uploadedFileSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  fileName: z.string().min(1),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

// ── Per-step schemas (client-side validation gates) ──────────────────────────

export const step1Schema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  bio: z
    .string()
    .trim()
    .min(200, "Bio must be at least 200 characters")
    .max(1000, "Bio must be at most 1000 characters"),
  yearsOfExperience: z.coerce
    .number({ error: "Enter a number" })
    .int("Must be a whole number")
    .min(0, "Must be 0 or more"),
  primaryCategory: z.enum(["CATERING", "DECORATION", "PHOTOGRAPHY"], {
    error: "Please select a category",
  }),
});

export const step2Schema = z.object({
  address: z.string().trim().min(1, "Address is required"),
  whatsappNumber: z
    .string()
    .regex(NIGERIAN_PHONE_RE, "Invalid Nigerian phone number (e.g. 08012345678)")
    .transform(normalizeNigerianPhone),
  instagramHandle: z.string().optional(),
});

export const step3Schema = z.object({
  cacNumber: cacNumberSchema,
  cacCertificate: uploadedFileSchema.nullable().optional(),
  governmentId: uploadedFileSchema,
  portfolioItems: z
    .array(uploadedFileSchema)
    .min(3, "Upload at least 3 portfolio images")
    .max(5, "Upload at most 5 portfolio images"),
});

export const step4Schema = z.object({
  bankName: z
    .string()
    .min(1, "Please select a bank")
    .refine((v) => (NIGERIAN_BANKS as readonly string[]).includes(v), {
      message: "Please select a valid bank",
    }),
  bankAccountNumber: bankAccountNumberSchema,
  bankAccountName: z.string().trim().min(1, "Account name is required"),
});

// ── Full schema — server-side re-validation on submit ─────────────────────────

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(1),
  bio: z.string().trim().min(200).max(1000),
  yearsOfExperience: z.number().int().min(0),
  primaryCategory: z.enum(["CATERING", "DECORATION", "PHOTOGRAPHY"]),
  address: z.string().trim().min(1),
  whatsappNumber: z
    .string()
    .regex(NIGERIAN_PHONE_RE)
    .transform(normalizeNigerianPhone),
  instagramHandle: z.string().optional(),
  cacNumber: cacNumberSchema,
  cacCertificate: uploadedFileSchema.nullable().optional(),
  governmentId: uploadedFileSchema,
  portfolioItems: z.array(uploadedFileSchema).min(3).max(5),
  bankName: z
    .string()
    .min(1)
    .refine((v) => (NIGERIAN_BANKS as readonly string[]).includes(v)),
  bankAccountNumber: bankAccountNumberSchema,
  bankAccountName: z.string().trim().min(1),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
export type ParsedOnboarding = z.output<typeof onboardingSchema>;
