import type { SchoolReportData } from '@/features/reports/types/reports.types';
import { BarChartCard } from '@/features/reports/components/BarChartCard';
import { LineChartCard } from '@/features/reports/components/LineChartCard';
import { EmptyState } from '@/features/reports/components/ReportsAsyncState';

type SchoolStatisticsProps = {
  data: SchoolReportData;
};

const LINES = [
  { key: 'meal', color: '#059669', label: 'Харчується' },
  { key: 'noMeal', color: '#64748b', label: 'Не харчується' },
  { key: 'absent', color: '#ef4444', label: 'Відсутній' },
];

const BARS = [
  { key: 'meal', color: '#059669', label: 'Харчується' },
  { key: 'noMeal', color: '#64748b', label: 'Не харчується' },
  { key: 'absent', color: '#ef4444', label: 'Відсутній' },
];

export function SchoolStatistics({ data }: SchoolStatisticsProps) {
  if (data.daily.length === 0) return <EmptyState />;

  const summaryCards = [
    { label: 'Середній % харчування', value: `${data.avgMealPct}%`, emoji: '📊' },
    { label: 'Найбільше відсутніх', value: data.mostAbsentClass, emoji: '⚠️' },
    { label: 'Кількість відсутностей', value: data.mostAbsentCount, emoji: '❌' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map(({ label, value, emoji }) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={label}
          >
            <p aria-label={label} className="text-2xl" role="img">
              {emoji}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </article>
        ))}
      </div>

      <LineChartCard
        data={data.daily}
        lines={LINES}
        title="Щоденна динаміка"
        xAxisKey="date"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard bars={BARS} data={data.weekly} title="Тижневі підсумки" xAxisKey="date" />
        <BarChartCard bars={BARS} data={data.monthly} title="Місячні підсумки" xAxisKey="date" />
      </div>
    </div>
  );
}
