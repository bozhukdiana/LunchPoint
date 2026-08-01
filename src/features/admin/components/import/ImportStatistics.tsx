import type { ImportPreview } from '@/features/admin/types/import.types';

type ImportStatisticsProps = {
  preview: ImportPreview;
};

type StatCardProps = {
  label: string;
  value: number;
  color: string;
};

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}

export function ImportStatistics({ preview }: ImportStatisticsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard color="border-slate-200 bg-white text-slate-800" label="Рядків у файлі" value={preview.totalRows} />
      <StatCard color="border-emerald-200 bg-emerald-50 text-emerald-800" label="Нових користувачів" value={preview.newUsers.length} />
      <StatCard color="border-amber-200 bg-amber-50 text-amber-800" label="Існуючих користувачів" value={preview.existingUsers.length} />
      <StatCard color="border-slate-200 bg-slate-50 text-slate-600" label="Пропущено рядків" value={preview.skippedRows.length} />
    </div>
  );
}
