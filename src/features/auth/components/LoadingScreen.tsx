export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-slate-900">
      <div className="text-center">
        <div
          aria-label="Завантаження"
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700"
          role="status"
        />
        <p className="mt-4 text-sm text-slate-600">Завантаження LunchPoint…</p>
      </div>
    </main>
  );
}
