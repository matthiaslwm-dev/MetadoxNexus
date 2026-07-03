import { PageHeader } from "@/components/stat-card";
import { SignalCsvImportForm } from "@/components/signal-csv-import-form";

export default function ImportSignalsPage() {
  return (
    <div>
      <PageHeader
        title="Import Signals"
        description="Bulk import signals from a CSV — AI analysis runs automatically on each row"
      />
      <SignalCsvImportForm />
    </div>
  );
}
