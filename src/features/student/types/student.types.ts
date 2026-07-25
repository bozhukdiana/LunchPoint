import type { Timestamp } from 'firebase/firestore';

export type StoredMealStatus = 'meal' | 'noMeal' | 'absent';

export type MealStatus = 'pending' | StoredMealStatus;

export type MealRecord = {
  id: string;
  studentId: string;
  classId: string;
  schoolYearId: string;
  date: string;
  status: StoredMealStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  updatedBy: string;
};
