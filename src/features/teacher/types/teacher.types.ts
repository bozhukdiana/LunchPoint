import type { MealStatus } from '@/features/student/types/student.types';

export type TeacherStudent = {
  uid: string;
  displayName: string;
  classId: string;
  mealStatus: MealStatus;
  mealRecordId: string | null;
};

export type MealStatusFilter = 'all' | MealStatus;
