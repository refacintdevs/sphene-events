import { Skeleton } from "@/components/ui/skeleton";

export default function PayDepositLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Skeleton className="mb-6 h-4 w-36" />

      {/* Heading */}
      <Skeleton className="mb-2 h-8 w-36" />
      <Skeleton className="mb-8 h-4 w-64" />

      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-36 rounded-md" />
        </div>
        <div className="border-t border-border" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="border-t border-border" />
        {/* Deposit amount box */}
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* What happens next */}
      <Skeleton className="mt-5 h-24 w-full rounded-xl" />

      {/* Button */}
      <Skeleton className="mt-8 h-11 w-full rounded-lg" />
      <Skeleton className="mx-auto mt-2 h-3 w-64" />
    </main>
  );
}
