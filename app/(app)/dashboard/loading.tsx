import { Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
