import { Skeleton } from "@/components/skeleton";

export default function LeadDetailLoading() {
  return (
    <div>
      <Skeleton className="mb-2 h-7 w-56" />
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </div>
  );
}
