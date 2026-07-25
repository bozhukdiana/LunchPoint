export type UserRole = 'admin' | 'teacher' | 'student'

export interface AppUserProfile {
  role: UserRole
  active: boolean
}

export type SessionStatus =
  | 'loading'
  | 'unauthenticated'
  | 'missing-profile'
  | 'inactive'
  | 'authenticated'
