import { doc, getDoc } from 'firebase/firestore'

import { db } from '../firebase/client'
import type { AppUserProfile, UserRole } from '../types/auth'

const ALLOWED_ROLES: UserRole[] = ['admin', 'teacher', 'student']

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && ALLOWED_ROLES.includes(value as UserRole)

export const getUserProfile = async (uid: string): Promise<AppUserProfile | null> => {
  const snapshot = await getDoc(doc(db, 'users', uid))

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()

  if (!isUserRole(data.role)) {
    throw new Error('Invalid user role in Firestore profile.')
  }

  if (typeof data.active !== 'boolean') {
    throw new Error('Invalid active flag in Firestore profile.')
  }

  return {
    role: data.role,
    active: data.active,
  }
}
