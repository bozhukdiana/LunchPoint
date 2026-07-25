import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SignInPage() {
  const { error, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    setSignInError(null);

    try {
      await signIn();
    } catch {
      setSignInError('Не вдалося виконати вхід через Google. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Ліцей №1 м. Копичинці</h1>
        <p className="mt-3 text-slate-600">Увійдіть, щоб перейти до обліку шкільного харчування.</p>

        {(signInError ?? error) && (
          <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {signInError ?? error}
          </p>
        )}

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => void handleSignIn()}
          type="button"
        >
          {isSubmitting ? 'Виконуємо вхід…' : 'Увійти через Google'}
        </button>
      </section>
    </main>
  );
}
