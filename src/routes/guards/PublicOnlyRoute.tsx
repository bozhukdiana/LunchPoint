import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleHomePath } from '@/routes/roleRoutes';

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { profile, status } = useAuth();

  if (status === 'authenticated' && profile) {
    return <Navigate replace to={getRoleHomePath(profile.role)} />;
  }

  if (status === 'unauthorized') {
    return <Navigate replace to="/unauthorized" />;
  }

  if (status === 'error') {
    return <Navigate replace to="/access-error" />;
  }

  return children;
}
