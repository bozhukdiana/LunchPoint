import type { ValidationError } from '@/features/admin/types/import.types';

type ValidationSummaryProps = {
  errors: ValidationError[];
  onDownloadErrors: () => void;
};

export function ValidationSummary({ errors, onDownloadErrors }: ValidationSummaryProps) {
  if (errors.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-emerald-600">✓</span>
        <p className="text-sm font-medium text-emerald-800">Валідація пройшла успішно. Файл готовий до імпорту.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50">
      <div className="flex items-center justify-between border-b border-red-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-red-500">✕</span>
          <p className="font-medium text-red-800">
            Знайдено {errors.length} {errors.length === 1 ? 'помилку' : 'помилок'}. Виправте їх перед імпортом.
          </p>
        </div>
        <button
          className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          onClick={onDownloadErrors}
          type="button"
        >
          Завантажити помилки
        </button>
      </div>
      <ul className="max-h-60 divide-y divide-red-100 overflow-y-auto">
        {errors.map((error, index) => (
          <li className="px-4 py-2 text-sm" key={index}>
            <span className="font-medium text-slate-700">Рядок {error.row}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-slate-600">{error.column}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-red-700">{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
