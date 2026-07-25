import { useAuth } from '@/features/auth/hooks/useAuth';

export function AuthErrorPage() {
  const { error, refreshSession, signOut } = useAuth();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Помилка перевірки доступу</h1>
        <p className="mt-4 text-slate-600">{error}</p>
        <div className="mt-8 flex gap-3">
          <button
            className="rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800"
            onClick={() => void refreshSession()}
            type="button"
          >
            Повторити
          </button>
          <button
            className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => void signOut()}
            type="button"
          >
            Вийти
          </button>
        </div>
      </section>
    </main>
  );
}
