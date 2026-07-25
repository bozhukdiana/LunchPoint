import type { Timestamp } from 'firebase/firestore';
import type { MealStatus, StoredMealStatus } from '@/features/student/types/student.types';

export type ReportFilters = {
  schoolYearId: string;
  classId: string;
  date: string;
  dateFrom: string;
  dateTo: string;
  status: MealStatus | 'all';
  teacherId: string;
  search: string;
};

export type DailyReportRow = {
  studentId: string;
  studentName: string;
  className: string;
  classId: string;
  status: MealStatus;
  updatedAt?: Timestamp;
  updatedBy: string;
  updatedByName: string;
  date: string;
};

export type ClassReportData = {
  classId: string;
  className: string;
  total: number;
  meal: number;
  noMeal: number;
  absent: number;
  pending: number;
  mealPct: number;
  noMealPct: number;
  absentPct: number;
  pendingPct: number;
};

export type DailyTotals = {
  date: string;
  meal: number;
  noMeal: number;
  absent: number;
  pending: number;
  total: number;
};

export type SchoolReportData = {
  daily: DailyTotals[];
  weekly: DailyTotals[];
  monthly: DailyTotals[];
  avgMealPct: number;
  mostAbsentClass: string;
  mostAbsentCount: number;
};

export type ReportStatistics = {
  date: string;
  total: number;
  meal: number;
  noMeal: number;
  absent: number;
  pending: number;
};

export type SortDirection = 'asc' | 'desc';

export type DailyTableSort = {
  column: keyof Pick<DailyReportRow, 'studentName' | 'className' | 'status' | 'updatedAt' | 'updatedByName'>;
  direction: SortDirection;
};

export type { MealStatus, StoredMealStatus };
