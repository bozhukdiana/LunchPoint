import type { ValidationError } from '@/features/admin/types/import.types';

type ErrorTableProps = {
  errors: ValidationError[];
};

export function ErrorTable({ errors }: ErrorTableProps) {
  if (errors.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-red-200 bg-white">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead className="bg-red-50 text-slate-700">
          <tr>
            <th className="p-3">Рядок</th>
            <th className="p-3">Стовпець</th>
            <th className="p-3">Помилка</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error, index) => (
            <tr className="border-t border-red-100" key={index}>
              <td className="p-3 font-medium">{error.row}</td>
              <td className="p-3 text-slate-600">{error.column}</td>
              <td className="p-3 text-red-700">{error.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
