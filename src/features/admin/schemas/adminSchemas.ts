import { z } from 'zod';
import { userRoles } from '@/features/auth/types/auth.types';

export const userFormSchema = z.object({
  uid: z.string().trim().min(1, 'Вкажіть Google UID користувача.'),
  displayName: z.string().trim().min(2, 'Вкажіть повне ім’я.'),
  email: z.string().trim().email('Вкажіть коректну електронну пошту.').or(z.literal('')),
  role: z.enum(userRoles),
  classId: z.string(),
});

export const classFormSchema = z.object({
  name: z.string().trim().min(1, 'Вкажіть назву класу.'),
  teacherId: z.string(),
  schoolYearId: z.string(),
});

export const schoolYearFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Вкажіть назву навчального року.'),
    startDate: z.string().min(1, 'Вкажіть дату початку.'),
    endDate: z.string().min(1, 'Вкажіть дату завершення.'),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: 'Дата завершення має бути не раніше дати початку.',
    path: ['endDate'],
  });

export const settingsFormSchema = z
  .object({
    schoolName: z.string().trim().min(2, 'Вкажіть назву закладу.'),
    applicationName: z.string().trim().min(2, 'Вкажіть назву застосунку.'),
    mealStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Некоректний час.'),
    mealEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Некоректний час.'),
    logoUrl: z.string().url('Вкажіть коректне посилання.').or(z.literal('')),
  })
  .refine((value) => value.mealEndTime > value.mealStartTime, {
    message: 'Час завершення має бути пізніше часу початку.',
    path: ['mealEndTime'],
  });

export type UserFormValues = z.infer<typeof userFormSchema>;
export type ClassFormValues = z.infer<typeof classFormSchema>;
export type SchoolYearFormValues = z.infer<typeof schoolYearFormSchema>;
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
