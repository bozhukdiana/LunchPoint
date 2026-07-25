import type { User } from 'firebase/auth';

export const userRoles = ['student', 'teacher', 'admin'] as const;

export type UserRole = (typeof userRoles)[number];

export type UserProfile = {
  uid: string;
  role: UserRole;
  displayName?: string;
  classId?: string;
  active?: boolean;
};

export type AuthStatus = 'loading' | 'unauthenticated' | 'unauthorized' | 'authenticated' | 'error';

export type AuthSession = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  error: string | null;
};
