import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { roleHomePath } from '../utils/roleRouting'

export const NotFoundPage = () => {
  const { status, profile } = useAuth()

  if (status === 'authenticated' && profile) {
    return <Navigate to={roleHomePath[profile.role]} replace />
  }

  return <Navigate to="/signin" replace />
}
