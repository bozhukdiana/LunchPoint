import type { TeacherStudent } from '@/features/teacher/types/teacher.types';

type TeacherStatisticsProps = {
  students: TeacherStudent[];
};

export function TeacherStatistics({ students }: TeacherStatisticsProps) {
  const total = students.length;
  const meal = students.filter((s) => s.mealStatus === 'meal').length;
  const noMeal = students.filter((s) => s.mealStatus === 'noMeal').length;
  const absent = students.filter((s) => s.mealStatus === 'absent').length;
  const pending = students.filter((s) => s.mealStatus === 'pending').length;

  const stats = [
    { emoji: '🍽️', label: 'Харчувалися', value: meal },
    { emoji: '🚫', label: 'Не харчувалися', value: noMeal },
    { emoji: '❌', label: 'Відсутні', value: absent },
    { emoji: '⏳', label: 'Не відмітилися', value: pending },
    { emoji: '👥', label: 'Всього', value: total },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map(({ emoji, label, value }) => (
        <article className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm" key={label}>
          <p className="text-2xl" role="img" aria-label={label}>
            {emoji}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </article>
      ))}
    </div>
  );
}
