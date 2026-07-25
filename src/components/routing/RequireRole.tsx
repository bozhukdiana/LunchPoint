import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { roleHomePath } from '../../utils/roleRouting'
import type { UserRole } from '../../types/auth'

interface RequireRoleProps extends PropsWithChildren {
  role: UserRole
}

export const RequireRole = ({ role, children }: RequireRoleProps) => {
  const { profile, status } = useAuth()

  if (status !== 'authenticated' || !profile) {
    return <Navigate to="/auth-gate" replace />
  }

  if (profile.role !== role) {
    return <Navigate to={roleHomePath[profile.role]} replace />
  }

  return children
}
