import { useForm } from 'react-hook-form'

interface SignInWithGoogleButtonProps {
  isLoading: boolean
  onSignIn: () => Promise<void>
}

interface SignInFormValues {
  submit: string
}

export const SignInWithGoogleButton = ({ isLoading, onSignIn }: SignInWithGoogleButtonProps) => {
  const { handleSubmit, register } = useForm<SignInFormValues>({
    defaultValues: { submit: 'google' },
  })

  const submit = handleSubmit(async () => {
    await onSignIn()
  })

  return (
    <form onSubmit={submit}>
      <input type="hidden" {...register('submit')} />
      <button type="submit" disabled={isLoading} className="primary-button">
        {isLoading ? 'Виконується вхід...' : 'Увійти через Google'}
      </button>
    </form>
  )
}
