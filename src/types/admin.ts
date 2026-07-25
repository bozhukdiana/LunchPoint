import type { UserRole } from './auth'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  classId: string | null
  active: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface SchoolYear {
  id: string
  title: string
  active: boolean
  archived: boolean
  createdAt: Date | null
}

export interface SchoolClass {
  id: string
  name: string
  classTeacherId: string | null
  archived: boolean
  createdAt: Date | null
}

export interface ClassFilterOption {
  id: string
  title: string
}

export interface GeneralSettings {
  schoolName: string
  applicationName: string
  mealStartTime: string
  mealEndTime: string
}

export interface LogEntry {
  id: string
  date: Date | null
  user: string
  action: string
  target: string
  details: string
}
