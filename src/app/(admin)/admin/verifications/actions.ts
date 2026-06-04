"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// ── Return type ───────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ── Zod schemas (invariant 5 — validate at the boundary) ─────────────────────

const vendorIdSchema = z.string().cuid();

const rejectSchema = z.object({
  vendorId: z.string().cuid(),
  reason: z.string().trim().min(1, "Reason is required"),
});

const requestInfoSchema = z.object({
  vendorId: z.string().cuid(),
  message: z.string().trim().min(1, "Message is required"),
});

// ── approveVendor ─────────────────────────────────────────────────────────────

export async function approveVendor(vendorId: string): Promise<ActionResult> {
  // Invariant 5: validate input first.
  const parsed = vendorIdSchema.safeParse(vendorId);
  if (!parsed.success) return { success: false, error: "Invalid vendor ID" };

  // Invariant 6 + 10: re-check role server-side before any write.
  let admin;
  try {
    admin = await requireRole("ADMIN");
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Status update + AuditLog must be ONE transaction (invariant 3 compliance).
    await db.$transaction([
      db.vendorProfile.update({
        where: { id: parsed.data },
        data: {
          verificationStatus: "APPROVED",
          verifiedAt: new Date(),
          verificationNotes: null,
        },
      }),
      db.auditLog.create({
        data: {
          action: "VENDOR_VERIFIED",
          actorUserId: admin.id,
          subjectType: "VendorProfile",
          subjectId: parsed.data,
          details: { action: "approved" },
        },
      }),
    ]);

    // [EMAIL STUB] vendor-verified → vendor email // TODO(Week3): wire Resend
    const vendor = await db.vendorProfile.findUnique({
      where: { id: parsed.data },
      select: { businessName: true, user: { select: { email: true } } },
    });
    console.log(
      `[EMAIL STUB] vendor-verified → ${vendor?.user.email} (${vendor?.businessName}) // TODO(Week3): Resend`,
    );
  } catch (err) {
    console.error("[approveVendor] DB error:", err);
    return { success: false, error: "Failed to approve vendor. Please try again." };
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { success: true };
}

// ── rejectVendor ──────────────────────────────────────────────────────────────

export async function rejectVendor(
  vendorId: string,
  reason: string,
): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse({ vendorId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let admin;
  try {
    admin = await requireRole("ADMIN");
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.$transaction([
      db.vendorProfile.update({
        where: { id: parsed.data.vendorId },
        data: {
          verificationStatus: "REJECTED",
          verificationNotes: parsed.data.reason,
        },
      }),
      db.auditLog.create({
        data: {
          action: "VENDOR_REJECTED",
          actorUserId: admin.id,
          subjectType: "VendorProfile",
          subjectId: parsed.data.vendorId,
          details: { reason: parsed.data.reason },
        },
      }),
    ]);

    const vendor = await db.vendorProfile.findUnique({
      where: { id: parsed.data.vendorId },
      select: { businessName: true, user: { select: { email: true } } },
    });
    // [EMAIL STUB] vendor-rejected → vendor email // TODO(Week3): wire Resend
    console.log(
      `[EMAIL STUB] vendor-rejected → ${vendor?.user.email} (${vendor?.businessName}), reason: "${parsed.data.reason}" // TODO(Week3): Resend`,
    );
  } catch (err) {
    console.error("[rejectVendor] DB error:", err);
    return { success: false, error: "Failed to reject vendor. Please try again." };
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { success: true };
}

// ── requestInfoVendor ─────────────────────────────────────────────────────────

export async function requestInfoVendor(
  vendorId: string,
  message: string,
): Promise<ActionResult> {
  const parsed = requestInfoSchema.safeParse({ vendorId, message });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let admin;
  try {
    admin = await requireRole("ADMIN");
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.$transaction([
      db.vendorProfile.update({
        where: { id: parsed.data.vendorId },
        data: {
          verificationStatus: "INFO_REQUESTED",
          verificationNotes: parsed.data.message,
        },
      }),
      db.auditLog.create({
        data: {
          action: "VENDOR_INFO_REQUESTED",
          actorUserId: admin.id,
          subjectType: "VendorProfile",
          subjectId: parsed.data.vendorId,
          details: { message: parsed.data.message },
        },
      }),
    ]);

    const vendor = await db.vendorProfile.findUnique({
      where: { id: parsed.data.vendorId },
      select: { businessName: true, user: { select: { email: true } } },
    });
    // [EMAIL STUB] request-info → vendor email // TODO(Week3): wire Resend
    console.log(
      `[EMAIL STUB] request-info → ${vendor?.user.email} (${vendor?.businessName}), message: "${parsed.data.message}" // TODO(Week3): Resend`,
    );
  } catch (err) {
    console.error("[requestInfoVendor] DB error:", err);
    return { success: false, error: "Failed to request info. Please try again." };
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { success: true };
}
