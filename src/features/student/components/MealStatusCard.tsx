import type { MealStatus } from '@/features/student/types/student.types';

const statusConfig: Record<MealStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: {
    label: 'Очікує відмітки',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  meal: {
    label: 'Харчувався',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  noMeal: {
    label: 'Не харчувався',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  absent: {
    label: 'Відсутній',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

type MealStatusCardProps = {
  status: MealStatus;
};

export function MealStatusCard({ status }: MealStatusCardProps) {
  const config = statusConfig[status];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Статус харчування</p>
      <p className={`mt-2 text-xl font-bold ${config.color}`}>{config.label}</p>
    </div>
  );
}
