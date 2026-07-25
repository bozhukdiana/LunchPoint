import { createContext } from 'react';
import type { AuthSession } from '@/features/auth/types/auth.types';

export type AuthContextValue = AuthSession & {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
