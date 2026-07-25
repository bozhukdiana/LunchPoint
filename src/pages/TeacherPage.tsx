import { PageShell } from '../components/layout/PageShell'
import { useAuth } from '../hooks/useAuth'

export const TeacherPage = () => {
  const { signOutUser, firebaseUser } = useAuth()

  return (
    <PageShell title="Панель вчителя">
      <p>Ви увійшли як: {firebaseUser?.email}</p>
      <button type="button" onClick={() => void signOutUser()} className="secondary-button">
        Вийти
      </button>
    </PageShell>
  )
}
