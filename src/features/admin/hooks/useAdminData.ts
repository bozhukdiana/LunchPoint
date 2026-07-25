import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateSchoolYear,
  archiveClass,
  archiveSchoolYear,
  createClass,
  createSchoolYear,
  createUser,
  getAdminUsers,
  getClasses,
  getDashboardData,
  getLogs,
  getSchoolYears,
  getSettings,
  saveSettings,
  setUserActive,
  updateClass,
  updateUser,
} from '@/features/admin/api/adminRepository';
import type {
  ClassFormValues,
  SchoolYearFormValues,
  SettingsFormValues,
  UserFormValues,
} from '@/features/admin/schemas/adminSchemas';

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  users: ['admin', 'users'] as const,
  classes: ['admin', 'classes'] as const,
  years: ['admin', 'school-years'] as const,
  settings: ['admin', 'settings'] as const,
  logs: ['admin', 'logs'] as const,
};

export function useAdminUsers() {
  return useQuery({ queryKey: adminQueryKeys.users, queryFn: getAdminUsers });
}

export function useClasses() {
  return useQuery({ queryKey: adminQueryKeys.classes, queryFn: getClasses });
}

export function useSchoolYears() {
  return useQuery({ queryKey: adminQueryKeys.years, queryFn: getSchoolYears });
}

export function useSettings() {
  return useQuery({ queryKey: adminQueryKeys.settings, queryFn: getSettings });
}

export function useLogs() {
  return useQuery({ queryKey: adminQueryKeys.logs, queryFn: getLogs });
}

export function useDashboard() {
  return useQuery({ queryKey: adminQueryKeys.dashboard, queryFn: getDashboardData });
}

function useAdminMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useCreateUser(actorId: string) {
  return useAdminMutation((values: UserFormValues) => createUser(values, actorId));
}

export function useUpdateUser(actorId: string) {
  return useAdminMutation(({ uid, values }: { uid: string; values: Omit<UserFormValues, 'uid'> }) =>
    updateUser(uid, values, actorId),
  );
}

export function useSetUserActive(actorId: string) {
  return useAdminMutation(({ uid, active }: { uid: string; active: boolean }) =>
    setUserActive(uid, active, actorId),
  );
}

export function useCreateClass(actorId: string) {
  return useAdminMutation((values: ClassFormValues) => createClass(values, actorId));
}

export function useUpdateClass(actorId: string) {
  return useAdminMutation(({ id, values }: { id: string; values: ClassFormValues }) =>
    updateClass(id, values, actorId),
  );
}

export function useArchiveClass(actorId: string) {
  return useAdminMutation((id: string) => archiveClass(id, actorId));
}

export function useCreateSchoolYear(actorId: string) {
  return useAdminMutation((values: SchoolYearFormValues) => createSchoolYear(values, actorId));
}

export function useActivateSchoolYear(actorId: string) {
  return useAdminMutation((id: string) => activateSchoolYear(id, actorId));
}

export function useArchiveSchoolYear(actorId: string) {
  return useAdminMutation((id: string) => archiveSchoolYear(id, actorId));
}

export function useSaveSettings(actorId: string) {
  return useAdminMutation((values: SettingsFormValues) => saveSettings(values, actorId));
}
