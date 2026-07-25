export function LoadingState() {
  return (
    <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
      Завантаження…
    </p>
  );
}

export function ErrorState() {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700" role="alert">
      Не вдалося завантажити дані. Оновіть сторінку та спробуйте ще раз.
    </p>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      Немає даних для відображення.
    </div>
  );
}
