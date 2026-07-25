import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
  type QueryConstraint,
} from 'firebase/firestore'

import { db } from '../../firebase/client'
import type { AdminUser } from '../../types/admin'
import type { UserRole } from '../../types/auth'
import { toDateOrNull } from '../../utils/firestore'

interface ListUsersFilters {
  role?: UserRole | 'all'
  classId?: string | 'all'
  search?: string
}

const usersCollection = collection(db, 'users')

const mapUser = (id: string, data: Record<string, unknown>): AdminUser => ({
  id,
  firstName: typeof data.firstName === 'string' ? data.firstName : '',
  lastName: typeof data.lastName === 'string' ? data.lastName : '',
  email: typeof data.email === 'string' ? data.email : '',
  role: (['admin', 'teacher', 'student'].includes(data.role as string) ? data.role : 'student') as UserRole,
  classId: typeof data.classId === 'string' && data.classId.length > 0 ? data.classId : null,
  active: typeof data.active === 'boolean' ? data.active : false,
  createdAt: toDateOrNull(data.createdAt),
  updatedAt: toDateOrNull(data.updatedAt),
})

export const listUsers = async (filters: ListUsersFilters): Promise<AdminUser[]> => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (filters.role && filters.role !== 'all') {
    constraints.push(where('role', '==', filters.role))
  }

  if (filters.classId && filters.classId !== 'all') {
    constraints.push(where('classId', '==', filters.classId))
  }

  const snapshot = await getDocs(query(usersCollection, ...constraints))
  const normalizedSearch = filters.search?.trim().toLowerCase()

  return snapshot.docs
    .map((item) => mapUser(item.id, item.data()))
    .filter((item) => {
      if (!normalizedSearch) {
        return true
      }

      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
      return (
        fullName.includes(normalizedSearch) ||
        item.email.toLowerCase().includes(normalizedSearch) ||
        item.firstName.toLowerCase().includes(normalizedSearch) ||
        item.lastName.toLowerCase().includes(normalizedSearch)
      )
    })
}

interface UpsertUserPayload {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  classId: string | null
}

export const createUser = async (payload: UpsertUserPayload) => {
  await addDoc(usersCollection, {
    ...payload,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateUser = async (id: string, payload: UpsertUserPayload) => {
  await updateDoc(doc(db, 'users', id), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export const setUserActiveState = async (id: string, active: boolean) => {
  await updateDoc(doc(db, 'users', id), {
    active,
    updatedAt: serverTimestamp(),
  })
}

export const listTeacherUsers = async () => {
  const snapshot = await getDocs(
    query(usersCollection, where('role', '==', 'teacher'), where('active', '==', true), orderBy('lastName', 'asc')),
  )

  return snapshot.docs.map((item) => {
    const data = item.data()
    const firstName = typeof data.firstName === 'string' ? data.firstName : ''
    const lastName = typeof data.lastName === 'string' ? data.lastName : ''

    return {
      id: item.id,
      name: `${lastName} ${firstName}`.trim(),
    }
  })
}
