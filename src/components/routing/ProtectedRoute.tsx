import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { LoadingScreen } from './LoadingScreen'

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { status } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/signin" replace />
  }

  if (status === 'missing-profile' || status === 'inactive') {
    return <Navigate to="/auth-gate" replace />
  }

  return children
}
