"use client";

export function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">
        Something went wrong loading this page.
      </p>
      <p className="mt-1 text-xs text-red-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        style={{ minHeight: 44 }}
      >
        Try again
      </button>
    </div>
  );
}
