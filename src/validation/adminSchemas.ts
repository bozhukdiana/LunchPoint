import { z } from 'zod'

import type { UserRole } from '../types/auth'

const USER_ROLES: [UserRole, ...UserRole[]] = ['admin', 'teacher', 'student']

export const userSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Імʼя є обовʼязковим'),
    lastName: z.string().trim().min(1, 'Прізвище є обовʼязковим'),
    email: z.string().trim().email('Вкажіть коректний email'),
    role: z.enum(USER_ROLES),
    classId: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'student' && (!value.classId || value.classId.trim().length === 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['classId'],
        message: 'Для учня потрібно обрати клас',
      })
    }
  })

export const schoolYearSchema = z.object({
  title: z.string().trim().min(1, 'Назва навчального року є обовʼязковою'),
})

export const classSchema = z.object({
  name: z.string().trim().min(1, 'Назва класу є обовʼязковою'),
  classTeacherId: z.string().optional(),
})

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const settingsSchema = z.object({
  schoolName: z.string().trim().min(1, 'Назва школи є обовʼязковою'),
  applicationName: z.string().trim().min(1, 'Назва застосунку є обовʼязковою'),
  mealStartTime: z.string().regex(timeRegex, 'Вкажіть час у форматі HH:MM'),
  mealEndTime: z.string().regex(timeRegex, 'Вкажіть час у форматі HH:MM'),
})

export type UserFormValues = z.infer<typeof userSchema>
export type SchoolYearFormValues = z.infer<typeof schoolYearSchema>
export type ClassFormValues = z.infer<typeof classSchema>
export type SettingsFormValues = z.infer<typeof settingsSchema>
