import { PageHeader } from "@/components/stat-card";
import { CsvImportForm } from "@/components/csv-import-form";

export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Import CSV"
        description="Upload agent/FA leads to import into Metadox Nexus"
      />
      <CsvImportForm />
    </div>
  );
}
