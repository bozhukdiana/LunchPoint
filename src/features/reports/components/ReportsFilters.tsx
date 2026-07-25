import type { SchoolClass, SchoolYear } from '@/features/admin/types/admin.types';
import type { AdminUser } from '@/features/admin/types/admin.types';
import type { ReportFilters } from '@/features/reports/types/reports.types';

type ReportsFiltersProps = {
  filters: ReportFilters;
  schoolYears: SchoolYear[];
  classes: SchoolClass[];
  teachers: AdminUser[];
  onChange: (updated: Partial<ReportFilters>) => void;
};

const statusOptions = [
  { value: 'all', label: 'Усі статуси' },
  { value: 'meal', label: 'Харчується' },
  { value: 'noMeal', label: 'Не харчується' },
  { value: 'absent', label: 'Відсутній' },
  { value: 'pending', label: 'Не відмітився' },
] as const;

export function ReportsFilters({
  filters,
  schoolYears,
  classes,
  teachers,
  onChange,
}: ReportsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block text-sm font-medium text-slate-700">
        Навчальний рік
        <select
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ schoolYearId: e.target.value })}
          value={filters.schoolYearId}
        >
          <option value="">Всі роки</option>
          {schoolYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Клас
        <select
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ classId: e.target.value })}
          value={filters.classId}
        >
          <option value="">Усі класи</option>
          {classes
            .filter((c) => !c.archived)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Дата
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ date: e.target.value })}
          type="date"
          value={filters.date}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Статус
        <select
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ status: e.target.value as ReportFilters['status'] })}
          value={filters.status}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Від
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          type="date"
          value={filters.dateFrom}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        До
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ dateTo: e.target.value })}
          type="date"
          value={filters.dateTo}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Вчитель
        <select
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ teacherId: e.target.value })}
          value={filters.teacherId}
        >
          <option value="">Усі вчителі</option>
          {teachers.map((t) => (
            <option key={t.uid} value={t.uid}>
              {t.displayName}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Пошук
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Ім'я або клас…"
          type="search"
          value={filters.search}
        />
      </label>
    </div>
  );
}
