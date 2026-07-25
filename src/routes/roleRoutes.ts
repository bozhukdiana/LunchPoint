import type { UserRole } from '@/features/auth/types/auth.types';

const roleHomePaths: Record<UserRole, string> = {
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
};

export function getRoleHomePath(role: UserRole): string {
  return roleHomePaths[role];
}
