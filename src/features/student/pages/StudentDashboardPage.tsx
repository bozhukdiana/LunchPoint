import { useAuth } from '@/features/auth/hooks/useAuth';
import { ErrorState, LoadingState, Toaster, TodaySummary } from '@/features/student/components';
import { useMarkMeal, useTodayMeal } from '@/features/student/hooks/useStudentData';
import { useToast } from '@/features/student/hooks/useToast';
import { useClasses } from '@/features/admin/hooks/useAdminData';

export function StudentDashboardPage() {
  const { profile, signOut } = useAuth();
  const studentUid = profile!.uid;
  const classId = profile!.classId ?? '';

  const mealQuery = useTodayMeal(studentUid);
  const classesQuery = useClasses();
  const markMealMutation = useMarkMeal(studentUid, classId);
  const toast = useToast();

  if (mealQuery.isPending || classesQuery.isPending) return <LoadingState />;
  if (mealQuery.isError) return <ErrorState />;

  const status = mealQuery.data ? mealQuery.data.status : 'pending';
  const className = classesQuery.data?.find((c) => c.id === classId)?.name ?? '—';

  const handleMarkMeal = () => {
    markMealMutation.mutate(undefined, {
      onSuccess: () => toast.success('✅ Відмітку збережено. Дякуємо!'),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Не вдалося зберегти відмітку. Спробуйте ще раз.'),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
          <button
            className="text-sm font-semibold text-slate-700 hover:text-emerald-700"
            onClick={() => void signOut()}
            type="button"
          >
            Вийти
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <TodaySummary
          className={className}
          displayName={profile!.displayName ?? '—'}
          isSaving={markMealMutation.isPending}
          onMarkMeal={handleMarkMeal}
          status={status}
        />
      </main>

      <Toaster toasts={toast.toasts} />
    </div>
  );
}
