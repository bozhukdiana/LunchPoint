import { useState } from 'react';
import type { ValidatedImportRow } from '@/features/admin/types/import.types';

const ROLE_LABELS: Record<string, string> = {
  student: 'Учень',
  teacher: 'Учитель',
  admin: 'Адмін',
};

const PAGE_SIZE = 50;

type ExcelPreviewProps = {
  newUsers: ValidatedImportRow[];
  existingUsers: ValidatedImportRow[];
};

export function ExcelPreview({ newUsers, existingUsers }: ExcelPreviewProps) {
  const [page, setPage] = useState(0);
  const allRows = [...newUsers, ...existingUsers];
  const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
  const visible = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (allRows.length === 0) return null;

  const isNew = (row: ValidatedImportRow) => newUsers.includes(row);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-800">Попередній перегляд</h3>
        <span className="text-sm text-slate-500">{allRows.length} рядків</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Ім'я</th>
              <th className="p-3">Email</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Клас</th>
              <th className="p-3">Активний</th>
              <th className="p-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr className="border-t border-slate-100" key={`${row.rowNumber}-${row.email}`}>
                <td className="p-3 text-slate-400">{row.rowNumber}</td>
                <td className="p-3 font-medium">{row.displayName}</td>
                <td className="p-3 text-slate-600">{row.email}</td>
                <td className="p-3">{ROLE_LABELS[row.role] ?? row.role}</td>
                <td className="p-3">{row.className || '—'}</td>
                <td className="p-3">{row.active ? 'Так' : 'Ні'}</td>
                <td className="p-3">
                  {isNew(row) ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Новий</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Існуючий</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <button
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            type="button"
          >
            ← Попередня
          </button>
          <span className="text-sm text-slate-500">
            Сторінка {page + 1} з {totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            type="button"
          >
            Наступна →
          </button>
        </div>
      )}
    </div>
  );
}
