import type { ClassReportData } from '@/features/reports/types/reports.types';
import { BarChartCard } from '@/features/reports/components/BarChartCard';
import { PieChartCard } from '@/features/reports/components/PieChartCard';
import { EmptyState } from '@/features/reports/components/ReportsAsyncState';

type ClassStatisticsProps = {
  data: ClassReportData[];
};

const BARS = [
  { key: 'meal', color: '#059669', label: 'Харчується' },
  { key: 'noMeal', color: '#64748b', label: 'Не харчується' },
  { key: 'absent', color: '#ef4444', label: 'Відсутній' },
  { key: 'pending', color: '#f59e0b', label: 'Очікується' },
];

export function ClassStatistics({ data }: ClassStatisticsProps) {
  if (data.length === 0) return <EmptyState />;

  const firstClass = data[0];

  const pieData =
    firstClass
      ? [
          { name: 'Харчується', value: firstClass.meal },
          { name: 'Не харчується', value: firstClass.noMeal },
          { name: 'Відсутній', value: firstClass.absent },
          { name: 'Очікується', value: firstClass.pending },
        ]
      : [];

  const barData = data.map((c) => ({
    name: c.className,
    meal: c.meal,
    noMeal: c.noMeal,
    absent: c.absent,
    pending: c.pending,
  }));

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Клас</th>
              <th className="p-3">Всього</th>
              <th className="p-3">🍽️ Харч.</th>
              <th className="p-3">🚫 Не харч.</th>
              <th className="p-3">❌ Відс.</th>
              <th className="p-3">⏳ Очік.</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cls) => (
              <tr className="border-t border-slate-100" key={cls.classId}>
                <td className="p-3 font-medium">{cls.className}</td>
                <td className="p-3">{cls.total}</td>
                <td className="p-3">
                  {cls.meal}{' '}
                  <span className="text-slate-400">({cls.mealPct}%)</span>
                </td>
                <td className="p-3">
                  {cls.noMeal}{' '}
                  <span className="text-slate-400">({cls.noMealPct}%)</span>
                </td>
                <td className="p-3">
                  {cls.absent}{' '}
                  <span className="text-slate-400">({cls.absentPct}%)</span>
                </td>
                <td className="p-3">
                  {cls.pending}{' '}
                  <span className="text-slate-400">({cls.pendingPct}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.length === 1 && firstClass ? (
          <PieChartCard data={pieData} title={`Розподіл — ${firstClass.className}`} />
        ) : null}
        <BarChartCard bars={BARS} data={barData} title="Порівняння класів" xAxisKey="name" />
      </div>
    </div>
  );
}
