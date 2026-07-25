import type { MealStatus, StoredMealStatus } from '@/features/student/types/student.types';
import type { TeacherStudent } from '@/features/teacher/types/teacher.types';
import { StudentMealActions } from '@/features/teacher/components/StudentMealActions';

const STATUS_BADGE: Record<MealStatus, { label: string; className: string }> = {
  pending: { label: '⏳ Очікує', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  meal: { label: '🍽️ Харчувався', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  noMeal: { label: '🚫 Не харчувався', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  absent: { label: '❌ Відсутній', className: 'border-red-200 bg-red-50 text-red-700' },
};

type StudentMealCardProps = {
  student: TeacherStudent;
  isSaving: boolean;
  onStatusChange: (studentId: string, status: StoredMealStatus, before: StoredMealStatus | null) => void;
};

export function StudentMealCard({ student, isSaving, onStatusChange }: StudentMealCardProps) {
  const badge = STATUS_BADGE[student.mealStatus];
  const before = student.mealStatus === 'pending' ? null : (student.mealStatus as StoredMealStatus);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{student.displayName}</p>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <StudentMealActions
        currentStatus={student.mealStatus}
        isSaving={isSaving}
        onStatusChange={(status) => onStatusChange(student.uid, status, before)}
      />
    </article>
  );
}
