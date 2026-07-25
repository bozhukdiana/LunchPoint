import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserRole } from '@/features/auth/types/auth.types';
import { getRoleHomePath } from '@/routes/roleRoutes';

type RequireRoleProps = PropsWithChildren<{
  allowedRoles: UserRole[];
}>;

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate replace to="/sign-in" />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate replace to={getRoleHomePath(profile.role)} />;
  }

  return children;
}
