import type { UserRole } from '../types/auth'

export const roleHomePath: Record<UserRole, string> = {
  admin: '/',
  teacher: '/teacher',
  student: '/student',
}
