import { useMemo, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import type { DailyReportRow, DailyTableSort } from '@/features/reports/types/reports.types';
import { EmptyState } from '@/features/reports/components/ReportsAsyncState';

type DailyTableProps = {
  rows: DailyReportRow[];
};

const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  meal: 'Харчується',
  noMeal: 'Не харчується',
  absent: 'Відсутній',
  pending: 'Не відмітився',
};

const statusColor: Record<string, string> = {
  meal: 'bg-emerald-100 text-emerald-800',
  noMeal: 'bg-slate-100 text-slate-700',
  absent: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-800',
};

function formatTime(ts?: Timestamp): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function sortRows(rows: DailyReportRow[], sort: DailyTableSort): DailyReportRow[] {
  return [...rows].sort((a, b) => {
    let cmp = 0;
    if (sort.column === 'updatedAt') {
      const aTime = a.updatedAt?.toMillis() ?? 0;
      const bTime = b.updatedAt?.toMillis() ?? 0;
      cmp = aTime - bTime;
    } else {
      cmp = String(a[sort.column]).localeCompare(String(b[sort.column]), 'uk');
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

type ColKey = DailyTableSort['column'];

const columns: { key: ColKey; label: string }[] = [
  { key: 'studentName', label: 'Учень' },
  { key: 'className', label: 'Клас' },
  { key: 'status', label: 'Статус' },
  { key: 'updatedAt', label: 'Час' },
  { key: 'updatedByName', label: 'Оновлено' },
];

export function DailyTable({ rows }: DailyTableProps) {
  const [sort, setSort] = useState<DailyTableSort>({ column: 'studentName', direction: 'asc' });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (col: ColKey) => {
    setSort((prev) =>
      prev.column === col
        ? { column: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column: col, direction: 'asc' },
    );
    setPage(0);
  };

  if (rows.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((col) => (
                <th
                  className="cursor-pointer select-none p-3 hover:text-slate-900"
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sort.column === col.key && (
                    <span className="ml-1 text-xs">{sort.direction === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr className="border-t border-slate-100" key={row.studentId}>
                <td className="p-3 font-medium">{row.studentName}</td>
                <td className="p-3">{row.className}</td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[row.status] ?? ''}`}
                  >
                    {statusLabel[row.status] ?? row.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{formatTime(row.updatedAt)}</td>
                <td className="p-3 text-slate-600">{row.updatedByName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Сторінка {page + 1} з {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              ←
            </button>
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
