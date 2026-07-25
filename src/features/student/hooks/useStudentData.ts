import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayMeal, markMeal } from '@/features/student/api/studentRepository';

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

  return useMutation({
    mutationFn: () => markMeal(studentUid, classId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentQueryKeys.todayMeal(studentUid) });
    },
  });
}
