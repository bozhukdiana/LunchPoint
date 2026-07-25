import type { Timestamp } from 'firebase/firestore';
import type { UserRole } from '@/features/auth/types/auth.types';

export type AdminUser = {
  uid: string;
  displayName: string;
  email?: string;
  role: UserRole;
  classId?: string;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type SchoolClass = {
  id: string;
  name: string;
  teacherId?: string;
  schoolYearId?: string;
  archived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type SchoolYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  archived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type SchoolSettings = {
  schoolName: string;
  applicationName: string;
  mealStartTime: string;
  mealEndTime: string;
  logoUrl?: string;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  createdAt?: Timestamp;
  metadata?: Record<string, unknown>;
};

export type AdminDashboardData = {
  users: AdminUser[];
  classes: SchoolClass[];
  schoolYears: SchoolYear[];
};
