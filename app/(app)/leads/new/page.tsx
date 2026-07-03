import Link from "next/link";
import { PageHeader } from "@/components/stat-card";
import { NewLeadForm } from "@/components/new-lead-form";

export default function NewLeadPage() {
  return (
    <div>
      <Link
        href="/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to leads
      </Link>

      <PageHeader title="Add Lead" description="Create a new lead" />

      <div className="max-w-2xl">
        <NewLeadForm />
      </div>
    </div>
  );
}
