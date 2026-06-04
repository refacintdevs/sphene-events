"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveVendor,
  rejectVendor,
  requestInfoVendor,
} from "@/app/(admin)/admin/verifications/actions";

interface VerifyActionButtonsProps {
  vendorId: string;
  businessName: string;
}

export function VerifyActionButtons({
  vendorId,
  businessName,
}: VerifyActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveVendor(vendorId);
      if (result.success) {
        toast.success(`${businessName} approved`);
        router.push("/admin/verifications");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Approve */}
      <Button
        onClick={handleApprove}
        disabled={isPending}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
      >
        <CheckCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Approve
      </Button>

      {/* Reject — Dialog with reason textarea (uncontrolled Dialog open state, BUG-003) */}
      <ReasonDialog
        trigger={
          <Button
            variant="destructive"
            disabled={isPending}
          >
            <XCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Reject
          </Button>
        }
        title={`Reject ${businessName}`}
        description="Provide a reason. The vendor will see this message and can resubmit after addressing the issues."
        fieldLabel="Rejection reason *"
        submitLabel="Reject vendor"
        submitVariant="destructive"
        onSubmit={async (text) => {
          const result = await rejectVendor(vendorId, text);
          if (result.success) {
            toast.success(`${businessName} rejected`);
            router.push("/admin/verifications");
          } else {
            toast.error(result.error);
          }
        }}
      />

      {/* Request Info — Dialog with message textarea */}
      <ReasonDialog
        trigger={
          <Button variant="outline" disabled={isPending}>
            <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Request Info
          </Button>
        }
        title={`Request more info from ${businessName}`}
        description="Describe what additional information or documents you need. The vendor will see this message."
        fieldLabel="Message to vendor *"
        submitLabel="Send request"
        submitVariant="default"
        onSubmit={async (text) => {
          const result = await requestInfoVendor(vendorId, text);
          if (result.success) {
            toast.success("Info request sent");
            router.push("/admin/verifications");
          } else {
            toast.error(result.error);
          }
        }}
      />
    </div>
  );
}

// ── Shared Dialog with Textarea ───────────────────────────────────────────────

interface ReasonDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  fieldLabel: string;
  submitLabel: string;
  submitVariant: "default" | "destructive";
  onSubmit: (text: string) => Promise<void>;
}

function ReasonDialog({
  trigger,
  title,
  description,
  fieldLabel,
  submitLabel,
  submitVariant,
  onSubmit,
}: ReasonDialogProps) {
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const text = textareaRef.current?.value.trim() ?? "";
    if (!text) {
      toast.error("Please enter a value before submitting.");
      return;
    }
    startTransition(async () => {
      await onSubmit(text);
    });
  }

  return (
    // Dialog in uncontrolled mode — no open/onOpenChange props (BUG-003)
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="reason-textarea">{fieldLabel}</Label>
          <Textarea
            id="reason-textarea"
            ref={textareaRef}
            placeholder="Enter your message…"
            rows={4}
            className="resize-none"
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            variant={submitVariant}
          >
            {isPending ? "Submitting…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
