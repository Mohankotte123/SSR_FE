"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { downloadBlob, exportSalesReportCsv } from "@/lib/api";

export function ExportReportButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setPending(true);
    setError(null);
    try {
      const blob = await exportSalesReportCsv();
      downloadBlob(blob, "sales-ledger.csv");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-pearl/5 px-5 py-2.5 font-display text-[12.5px] font-semibold text-[#8B97AD] transition hover:border-gold/30 hover:text-gold disabled:opacity-60"
      >
        <Download className="h-3.5 w-3.5" />
        {pending ? "Exporting…" : "Export Report"}
      </button>
      {error ? <p className="text-xs text-plot-sold">{error}</p> : null}
    </div>
  );
}
