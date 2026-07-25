import { useState } from 'react'

import { SignInWithGoogleButton } from '../components/auth/SignInWithGoogleButton'
import { PageShell } from '../components/layout/PageShell'
import { useAuth } from '../hooks/useAuth'

export const SignInPage = () => {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
    } catch {
      setError('Не вдалося виконати вхід через Google. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="Вхід до LunchPoint">
      <p>Увійдіть через корпоративний Google-акаунт вашої школи.</p>
      <SignInWithGoogleButton isLoading={isSubmitting} onSignIn={handleSignIn} />
      {error && <p className="error-message">{error}</p>}
    </PageShell>
  )
}
