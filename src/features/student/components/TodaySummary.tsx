import type { MealStatus } from '@/features/student/types/student.types';
import { MealButton } from '@/features/student/components/MealButton';
import { MealStatusCard } from '@/features/student/components/MealStatusCard';

function formatTodayDate(): string {
  return new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type TodaySummaryProps = {
  displayName: string;
  className: string;
  status: MealStatus;
  isSaving: boolean;
  onMarkMeal: () => void;
};

export function TodaySummary({ displayName, className, status, isSaving, onMarkMeal }: TodaySummaryProps) {
  const todayLabel = formatTodayDate();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Учень</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{displayName}</p>
        <p className="mt-0.5 text-sm text-slate-600">{className}</p>
        <p className="mt-3 text-sm text-slate-500">{todayLabel}</p>
      </div>

      <MealStatusCard status={status} />

      {status === 'pending' && <MealButton isPending={isSaving} onClick={onMarkMeal} />}
    </div>
  );
}
