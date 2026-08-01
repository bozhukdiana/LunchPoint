import { downloadTemplate } from '@/features/admin/api/excelImportRepository';
import { useState } from 'react';

export function DownloadTemplateButton() {
  const [downloading, setDownloading] = useState(false);

  const handleClick = async () => {
    setDownloading(true);
    try {
      await downloadTemplate();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
      disabled={downloading}
      onClick={() => void handleClick()}
      type="button"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3M3 17a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-3H3v3Z" />
      </svg>
      {downloading ? 'Завантаження…' : 'Завантажити шаблон'}
    </button>
  );
}
