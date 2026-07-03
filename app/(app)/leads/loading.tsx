import { Skeleton } from "@/components/skeleton";

export default function LeadsLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-32" />
      <Skeleton className="mb-4 h-11 w-full sm:max-w-xs" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}
