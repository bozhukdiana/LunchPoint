import { useQuery } from '@tanstack/react-query';
import {
  getClassReport,
  getDailyReport,
  getSchoolReport,
  getStatistics,
} from '@/features/reports/api/reportsRepository';
import type { ReportFilters } from '@/features/reports/types/reports.types';

export const reportsQueryKeys = {
  statistics: (date: string, classId: string) => ['reports', 'statistics', date, classId] as const,
  daily: (filters: ReportFilters) => ['reports', 'daily', filters] as const,
  classReport: (filters: ReportFilters) => ['reports', 'class', filters] as const,
  schoolReport: (filters: ReportFilters) => ['reports', 'school', filters] as const,
};

export function useReportStatistics(filters: Pick<ReportFilters, 'date' | 'classId'>) {
  return useQuery({
    queryKey: reportsQueryKeys.statistics(filters.date, filters.classId),
    queryFn: () => getStatistics(filters),
    enabled: !!filters.date,
    staleTime: 60_000,
  });
}

export function useDailyReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportsQueryKeys.daily(filters),
    queryFn: () => getDailyReport(filters),
    enabled: !!filters.date,
    staleTime: 60_000,
  });
}

export function useClassReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportsQueryKeys.classReport(filters),
    queryFn: () => getClassReport(filters),
    enabled: !!filters.date,
    staleTime: 60_000,
  });
}

export function useSchoolReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportsQueryKeys.schoolReport(filters),
    queryFn: () => getSchoolReport(filters),
    enabled: !!(filters.dateFrom && filters.dateTo),
    staleTime: 60_000,
  });
}
