import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { LoadingScreen } from './LoadingScreen'
import { roleHomePath } from '../../utils/roleRouting'

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const { status, profile } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return children
  }

  if (status === 'authenticated' && profile) {
    return <Navigate to={roleHomePath[profile.role]} replace />
  }

  return <Navigate to="/auth-gate" replace />
}
