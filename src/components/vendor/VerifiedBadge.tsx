import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  hasCac: boolean;
  className?: string;
}

export function VerifiedBadge({ hasCac, className }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-medium text-secondary ${className ?? ""}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {hasCac ? "Verified Business" : "Verified Individual"}
    </span>
  );
}
