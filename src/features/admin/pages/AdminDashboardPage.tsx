import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState } from '@/features/admin/components/AsyncState';
import { useDashboard } from '@/features/admin/hooks/useAdminData';

export function AdminDashboardPage() {
  const dashboard = useDashboard();

  if (dashboard.isPending) return <LoadingState />;
  if (dashboard.isError || !dashboard.data) return <ErrorState />;

  const { users, classes, schoolYears } = dashboard.data;
  const cards = [
    ['Активні користувачі', users.filter((user) => user.active).length],
    ['Активні класи', classes.filter((schoolClass) => !schoolClass.archived).length],
    ['Активний навчальний рік', schoolYears.filter((year) => year.active).length],
  ];

  return (
    <AdminPage description="Операційний стан LunchPoint." title="Огляд">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>
    </AdminPage>
  );
}
