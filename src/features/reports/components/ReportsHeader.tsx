type ReportsHeaderProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function ReportsHeader({ title, description, actions }: ReportsHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>
      {actions}
    </header>
  );
}
