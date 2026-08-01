type ImportProgressProps = {
  progress: number;
};

export function ImportProgress({ progress }: ImportProgressProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="mb-3 font-semibold text-slate-800">Імпорт виконується…</p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-sm text-slate-500">{progress}%</p>
    </div>
  );
}
