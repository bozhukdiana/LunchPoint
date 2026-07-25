import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayMeal, markMeal } from '@/features/student/api/studentRepository';
import type { MealRecord } from '@/features/student/types/student.types';
import { getTodayDateString } from '@/features/student/utils/dateUtils';

export const studentQueryKeys = {
  todayMeal: (uid: string) => ['student', 'meal', 'today', uid] as const,
};

export function useTodayMeal(studentUid: string) {
  return useQuery({
    queryKey: studentQueryKeys.todayMeal(studentUid),
    queryFn: () => getTodayMeal(studentUid),
  });
}

export function useMarkMeal(studentUid: string, classId: string) {
  const queryClient = useQueryClient();
  const key = studentQueryKeys.todayMeal(studentUid);

  return useMutation({
    mutationFn: () => markMeal(studentUid, classId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MealRecord | null>(key);
      const today = getTodayDateString();
      const optimistic: MealRecord = {
        id: `${today}_${studentUid}`,
        studentId: studentUid,
        classId,
        schoolYearId: '',
        date: today,
        status: 'meal',
        updatedBy: studentUid,
      };
      queryClient.setQueryData<MealRecord | null>(key, optimistic);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(key, context?.previous ?? null);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
