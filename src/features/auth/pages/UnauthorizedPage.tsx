import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function UnauthorizedPage() {
  const { error, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    setIsSubmitting(true);
    await signOut();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
        <h1 className="mt-3 text-2xl font-bold">Доступ ще не надано</h1>
        <p className="mt-4 text-slate-600">{error ?? 'Ваш акаунт ще не активовано адміністратором.'}</p>
        <button
          className="mt-8 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => void handleSignOut()}
          type="button"
        >
          {isSubmitting ? 'Вихід…' : 'Вийти'}
        </button>
      </section>
    </main>
  );
}
