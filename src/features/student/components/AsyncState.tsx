export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-600">Завантаження…</p>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700" role="alert">
        Не вдалося завантажити дані. Оновіть сторінку та спробуйте ще раз.
      </p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
      Немає даних для відображення.
    </div>
  );
}
