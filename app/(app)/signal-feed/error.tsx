"use client";

import { ErrorState } from "@/components/error-state";

export default function SignalFeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} />;
}
