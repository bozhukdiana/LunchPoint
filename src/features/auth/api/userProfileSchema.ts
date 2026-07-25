import { z } from 'zod';
import { userRoles } from '@/features/auth/types/auth.types';

export const userProfileSchema = z
  .object({
    role: z.enum(userRoles),
    displayName: z.string().trim().min(1).optional(),
    classId: z.string().trim().min(1).optional(),
    active: z.boolean().optional(),
  })
  .passthrough();
