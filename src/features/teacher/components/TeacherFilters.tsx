import type { MealStatusFilter } from '@/features/teacher/types/teacher.types';

const FILTERS: { value: MealStatusFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'pending', label: '⏳ Очікують' },
  { value: 'meal', label: '🍽️ Харчувалися' },
  { value: 'noMeal', label: '🚫 Не харчувалися' },
  { value: 'absent', label: '❌ Відсутні' },
];

type TeacherFiltersProps = {
  value: MealStatusFilter;
  onChange: (value: MealStatusFilter) => void;
};

export function TeacherFilters({ value, onChange }: TeacherFiltersProps) {
  return (
    <div aria-label="Фільтр за статусом" className="flex gap-2 overflow-x-auto pb-1" role="group">
      {FILTERS.map((filter) => (
        <button
          aria-pressed={value === filter.value}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            value === filter.value
              ? 'bg-emerald-700 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
          key={filter.value}
          onClick={() => onChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
