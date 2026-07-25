import type { ImportResult } from '@/features/admin/types/import.types';

type ImportResultProps = {
  result: ImportResult;
  onReset: () => void;
};

export function ImportResult({ result, onReset }: ImportResultProps) {
  const hasErrors = result.errors > 0;

  return (
    <div className={`rounded-xl border p-6 ${hasErrors ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className={`text-3xl ${hasErrors ? 'text-amber-500' : 'text-emerald-500'}`}>
          {hasErrors ? '⚠' : '✓'}
        </span>
        <h3 className={`text-lg font-bold ${hasErrors ? 'text-amber-900' : 'text-emerald-900'}`}>
          {hasErrors ? 'Імпорт завершено з помилками' : 'Імпорт успішно завершено!'}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-emerald-700">{result.created}</p>
          <p className="text-sm text-slate-600">Створено</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-amber-700">{result.updated}</p>
          <p className="text-sm text-slate-600">Оновлено</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-600">{result.skipped}</p>
          <p className="text-sm text-slate-600">Пропущено</p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-red-600">{result.errors}</p>
          <p className="text-sm text-slate-600">Помилок</p>
        </div>
      </div>
      <button
        className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        onClick={onReset}
        type="button"
      >
        Імпортувати ще один файл
      </button>
    </div>
  );
}
