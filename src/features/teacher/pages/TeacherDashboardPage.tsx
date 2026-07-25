import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ErrorState, LoadingState } from '@/features/student/components/AsyncState';
import { EmptyState } from '@/features/student/components/AsyncState';
import { Toaster } from '@/features/student/components/Toaster';
import { useToast } from '@/features/student/hooks/useToast';
import { formatTodayDate } from '@/features/student/utils/dateUtils';
import {
  StudentMealCard,
  TeacherFilters,
  TeacherHeader,
  TeacherSearch,
  TeacherStatistics,
} from '@/features/teacher/components';
import { useActiveSchoolYearId, useTeacherClass, useTeacherStudents, useUpdateMealStatus } from '@/features/teacher/hooks/useTeacherData';
import type { MealStatusFilter } from '@/features/teacher/types/teacher.types';
import type { StoredMealStatus } from '@/features/student/types/student.types';

export function TeacherDashboardPage() {
  const { profile } = useAuth();
  const teacherId = profile!.uid;
  const classId = profile!.classId ?? '';
  const teacherName = profile!.displayName ?? '—';
  const todayLabel = useMemo(() => formatTodayDate(), []);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MealStatusFilter>('all');
  const toast = useToast();

  const studentsQuery = useTeacherStudents(classId);
  const classQuery = useTeacherClass(classId);
  const schoolYearQuery = useActiveSchoolYearId();

  const schoolYearId = schoolYearQuery.data ?? '';
  const updateMutation = useUpdateMealStatus(classId, schoolYearId, teacherId);

  if (studentsQuery.isPending || classQuery.isPending || schoolYearQuery.isPending) {
    return <LoadingState />;
  }

  if (studentsQuery.isError) {
    return <ErrorState />;
  }

  const students = studentsQuery.data ?? [];
  const className = classQuery.data?.name ?? '—';

  const filteredStudents = students.filter((student) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = term === '' || student.displayName.toLowerCase().includes(term);
    const matchesFilter = filter === 'all' || student.mealStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (studentId: string, status: StoredMealStatus, before: StoredMealStatus | null) => {
    updateMutation.mutate(
      { studentId, status, before },
      {
        onSuccess: () => toast.success('✅ Статус оновлено'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Не вдалося оновити статус. Спробуйте ще раз.'),
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TeacherHeader className={className} teacherName={teacherName} todayLabel={todayLabel} />

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        <TeacherStatistics students={students} />

        <div className="space-y-3">
          <TeacherSearch value={search} onChange={setSearch} />
          <TeacherFilters value={filter} onChange={setFilter} />
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <StudentMealCard
                isSaving={updateMutation.isPending}
                key={student.uid}
                onStatusChange={handleStatusChange}
                student={student}
              />
            ))}
          </div>
        )}
      </main>

      <Toaster toasts={toast.toasts} />
    </div>
  );
}
