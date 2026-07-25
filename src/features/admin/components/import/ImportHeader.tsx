type ImportHeaderProps = {
  onReset: () => void;
  hasFile: boolean;
};

export function ImportHeader({ onReset, hasFile }: ImportHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Імпорт користувачів</h1>
        <p className="mt-1 text-slate-600">Завантажте Excel-файл для масового додавання або оновлення користувачів.</p>
      </div>
      {hasFile && (
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={onReset}
          type="button"
        >
          Почати заново
        </button>
      )}
    </div>
  );
}
