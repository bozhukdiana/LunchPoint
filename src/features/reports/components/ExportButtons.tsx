import { useState } from 'react';
import { exportExcel, exportPdf } from '@/features/reports/api/reportsRepository';
import type { DailyReportRow, ReportFilters } from '@/features/reports/types/reports.types';

type ExportButtonsProps = {
  filters: ReportFilters;
  rows: DailyReportRow[];
};

export function ExportButtons({ filters, rows }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleExcel = async () => {
    setExporting('excel');
    try {
      await exportExcel(filters, rows);
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    setExporting('pdf');
    try {
      await exportPdf(filters, rows);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="flex items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        disabled={!!exporting || rows.length === 0}
        onClick={() => void handleExcel()}
        type="button"
      >
        {exporting === 'excel' ? 'Експорт…' : '⬇ Excel'}
      </button>
      <button
        className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        disabled={!!exporting || rows.length === 0}
        onClick={() => void handlePdf()}
        type="button"
      >
        {exporting === 'pdf' ? 'Експорт…' : '⬇ PDF'}
      </button>
    </div>
  );
}
