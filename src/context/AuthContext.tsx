import { createContext } from 'react'
import type { User } from 'firebase/auth'

import type { AppUserProfile, SessionStatus } from '../types/auth'

export interface AuthContextValue {
  firebaseUser: User | null
  profile: AppUserProfile | null
  status: SessionStatus
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
