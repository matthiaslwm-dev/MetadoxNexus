import { Skeleton } from "@/components/skeleton";

export default function ScheduleLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-32" />
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-96" />
    </div>
  );
}
