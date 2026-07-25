import type { ReportStatistics } from '@/features/reports/types/reports.types';

type StatisticCardsProps = {
  stats: ReportStatistics;
};

const cards = [
  { emoji: '📅', label: 'Дата', key: 'date' as const },
  { emoji: '👥', label: 'Учні', key: 'total' as const },
  { emoji: '🍽️', label: 'Харчуються', key: 'meal' as const },
  { emoji: '🚫', label: 'Не харчуються', key: 'noMeal' as const },
  { emoji: '❌', label: 'Відсутні', key: 'absent' as const },
  { emoji: '⏳', label: 'Очікується', key: 'pending' as const },
] as const;

export function StatisticCards({ stats }: StatisticCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ emoji, label, key }) => (
        <article
          className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
          key={key}
        >
          <p aria-label={label} className="text-2xl" role="img">
            {emoji}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats[key]}</p>
          <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </article>
      ))}
    </div>
  );
}
