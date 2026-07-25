import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function RequireAuthenticated({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'unauthenticated') {
    return <Navigate replace state={{ from: location }} to="/sign-in" />;
  }

  if (status === 'unauthorized') {
    return <Navigate replace to="/unauthorized" />;
  }

  if (status === 'error') {
    return <Navigate replace to="/access-error" />;
  }

  return children;
}
