import { Navigate } from 'react-router-dom'

import { LoadingScreen } from '../components/routing/LoadingScreen'
import { PageShell } from '../components/layout/PageShell'
import { useAuth } from '../hooks/useAuth'
import { roleHomePath } from '../utils/roleRouting'

export const AuthGatePage = () => {
  const { status, profile, signOutUser } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/signin" replace />
  }

  if (status === 'missing-profile') {
    return (
      <PageShell title="Доступ обмежено">
        <p>Ваш акаунт ще не активовано адміністратором.</p>
        <button type="button" onClick={() => void signOutUser()} className="secondary-button">
          Вийти
        </button>
      </PageShell>
    )
  }

  if (status === 'inactive') {
    return (
      <PageShell title="Доступ обмежено">
        <p>Ваш акаунт деактивовано.</p>
        <button type="button" onClick={() => void signOutUser()} className="secondary-button">
          Вийти
        </button>
      </PageShell>
    )
  }

  if (profile) {
    return <Navigate to={roleHomePath[profile.role]} replace />
  }

  return <Navigate to="/signin" replace />
}
