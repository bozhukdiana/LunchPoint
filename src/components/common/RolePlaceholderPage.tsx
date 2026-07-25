type RolePlaceholderPageProps = {
  title: string;
};

export function RolePlaceholderPage({ title }: RolePlaceholderPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-slate-600">Розділ буде доступний незабаром.</p>
      </section>
    </main>
  );
}
