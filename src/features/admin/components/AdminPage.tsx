import type { PropsWithChildren, ReactNode } from 'react';

type AdminPageProps = PropsWithChildren<{
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <section>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-slate-600">{description}</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
