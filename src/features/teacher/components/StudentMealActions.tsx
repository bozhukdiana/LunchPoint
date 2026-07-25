import type { MealStatus, StoredMealStatus } from '@/features/student/types/student.types';

type Action = {
  status: StoredMealStatus;
  label: string;
  activeClass: string;
  inactiveClass: string;
};

const ACTIONS: Action[] = [
  {
    status: 'meal',
    label: '🍽️ Харчувався',
    activeClass: 'bg-emerald-700 text-white',
    inactiveClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    status: 'noMeal',
    label: '🚫 Не харчувався',
    activeClass: 'bg-slate-700 text-white',
    inactiveClass: 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
  },
  {
    status: 'absent',
    label: '❌ Відсутній',
    activeClass: 'bg-red-600 text-white',
    inactiveClass: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  },
];

type StudentMealActionsProps = {
  currentStatus: MealStatus;
  isSaving: boolean;
  onStatusChange: (status: StoredMealStatus) => void;
};

export function StudentMealActions({ currentStatus, isSaving, onStatusChange }: StudentMealActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ACTIONS.map(({ status, label, activeClass, inactiveClass }) => {
        const isActive = currentStatus === status;
        return (
          <button
            aria-pressed={isActive}
            className={`rounded-xl py-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive ? activeClass : inactiveClass
            }`}
            disabled={isSaving || isActive}
            key={status}
            onClick={() => onStatusChange(status)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
