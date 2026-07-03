"use client";

import { useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseLeadsCsv, REQUIRED_COLUMNS, type CsvRow } from "@/lib/csv";
import { importLeads, type ImportResult } from "@/app/(app)/import/actions";
import { primaryButtonClass } from "@/lib/ui";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Icon } from "@/components/icons";

export function CsvImportForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  function processFile(file: File) {
    setResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseLeadsCsv(text);
      if (!parsed.ok) {
        setParseError(parsed.error);
        setRows(null);
      } else {
        setParseError(null);
        setRows(parsed.rows);
      }
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleImport() {
    if (!rows) return;
    startTransition(async () => {
      const res = await importLeads(rows);
      setResult(res);
      setRows(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  const preview = rows?.slice(0, 10) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="mb-3 text-sm text-gray-600">
          Required columns:{" "}
          <span className="font-medium text-gray-800">
            {REQUIRED_COLUMNS.join(", ")}
          </span>
        </p>

        <motion.label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? "#111827" : "#d1d5db",
            backgroundColor: isDragging ? "#f9fafb" : "#ffffff",
          }}
          transition={{ duration: 0.15 }}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center"
        >
          <Icon name="upload" className="h-6 w-6 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Tap to upload, or drag a CSV here
          </span>
          <span className="text-xs text-gray-400">.csv files only</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.label>

        <AnimatePresence>
          {fileName && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden text-sm text-gray-500"
            >
              Selected: <span className="font-medium text-gray-700">{fileName}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {parseError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {parseError}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-lg px-3 py-2 text-sm ${
              result.errors.length > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            <p>
              {result.errors.length === 0 && "✓ "}
              Imported {result.imported} new lead(s), {result.metricsInserted}{" "}
              metric row(s) added.
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rows && rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="mb-3 text-sm font-medium text-gray-700">
              Preview (first 10 of {rows.length} rows)
            </p>

            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Agent Name</th>
                    <th className="px-4 py-3 font-medium">Organisation</th>
                    <th className="px-4 py-3 font-medium">Measure Name</th>
                    <th className="px-4 py-3 font-medium">Ranking</th>
                    <th className="px-4 py-3 font-medium">Earnings</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer(0.03)}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-gray-100"
                >
                  {preview.map((row, i) => (
                    <motion.tr key={i} variants={fadeInUp}>
                      <td className="px-4 py-3 text-gray-900">
                        {row.agentName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.organisation || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.measureName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.ranking ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.measureValue ?? "—"}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            <motion.div
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden"
            >
              {preview.map((row, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm"
                >
                  <p className="font-medium text-gray-900">{row.agentName}</p>
                  <p className="text-gray-500">{row.organisation || "—"}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-400">Measure</p>
                      <p className="text-gray-900">{row.measureName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ranking</p>
                      <p className="text-gray-900">{row.ranking ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Earnings</p>
                      <p className="text-gray-900">{row.measureValue ?? "—"}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              type="button"
              onClick={handleImport}
              disabled={pending}
              whileTap={{ scale: 0.98 }}
              className={`relative mt-4 w-full overflow-hidden sm:w-auto sm:px-8 ${primaryButtonClass}`}
              style={{ minHeight: 44 }}
            >
              {pending && (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-white/15"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className="relative">
                {pending ? "Importing..." : `Import ${rows.length} row(s)`}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
