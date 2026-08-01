import type { UserRole } from '@/features/auth/types/auth.types';

export type ImportRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  className: string;
  active: boolean;
};

export type ValidatedImportRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  className: string;
  active: boolean;
  displayName: string;
};

export type ValidationError = {
  row: number;
  column: string;
  message: string;
};

export type ImportMode = 'create' | 'update' | 'both';

export type ImportPreview = {
  totalRows: number;
  newUsers: ValidatedImportRow[];
  existingUsers: ValidatedImportRow[];
  skippedRows: number[];
  errors: ValidationError[];
};

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
};
