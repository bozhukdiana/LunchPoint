import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MealStatus, StoredMealStatus } from '@/features/student/types/student.types';
import {
  getActiveSchoolYearId,
  getClassStudents,
  getTeacherClass,
  getTodayMealRecordsForClass,
  updateMealStatus,
} from '@/features/teacher/api/teacherRepository';
import type { TeacherStudent } from '@/features/teacher/types/teacher.types';

export const teacherQueryKeys = {
  teacherClass: (classId: string) => ['teacher', 'class', classId] as const,
  students: (classId: string) => ['teacher', 'students', classId] as const,
  schoolYearId: ['teacher', 'schoolYearId'] as const,
};

export function useTeacherClass(classId: string) {
  return useQuery({
    queryKey: teacherQueryKeys.teacherClass(classId),
    queryFn: () => getTeacherClass(classId),
    enabled: !!classId,
  });
}

export function useTeacherStudents(classId: string) {
  return useQuery({
    queryKey: teacherQueryKeys.students(classId),
    queryFn: async (): Promise<TeacherStudent[]> => {
      const [students, meals] = await Promise.all([
        getClassStudents(classId),
        getTodayMealRecordsForClass(classId),
      ]);
      const mealMap = new Map(meals.map((m) => [m.studentId, m]));
      return students.map((s) => {
        const meal = mealMap.get(s.uid);
        const mealStatus: MealStatus = meal ? meal.status : 'pending';
        return {
          uid: s.uid,
          displayName: s.displayName ?? '',
          classId: s.classId ?? classId,
          mealStatus,
          mealRecordId: meal?.id ?? null,
        };
      });
    },
    enabled: !!classId,
  });
}

export function useActiveSchoolYearId() {
  return useQuery({
    queryKey: teacherQueryKeys.schoolYearId,
    queryFn: getActiveSchoolYearId,
  });
}

export function useUpdateMealStatus(classId: string, schoolYearId: string, teacherId: string) {
  const queryClient = useQueryClient();
  const key = teacherQueryKeys.students(classId);

  return useMutation({
    mutationFn: ({
      studentId,
      status,
      before,
    }: {
      studentId: string;
      status: StoredMealStatus;
      before: StoredMealStatus | null;
    }) => updateMealStatus(studentId, classId, schoolYearId, status, teacherId, before),
    onMutate: async ({ studentId, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TeacherStudent[]>(key);
      queryClient.setQueryData<TeacherStudent[]>(
        key,
        (prev) => prev?.map((s) => (s.uid === studentId ? { ...s, mealStatus: status } : s)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
