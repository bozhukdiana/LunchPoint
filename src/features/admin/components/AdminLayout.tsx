import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

const navigation = [
  ['/', 'Огляд'],
  ['/users', 'Користувачі'],
  ['/classes', 'Класи'],
  ['/school-years', 'Навчальні роки'],
  ['/settings', 'Налаштування'],
  ['/logs', 'Журнал змін'],
  ['/reports', 'Звіти'],
] as const;

export function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
            <p className="text-sm text-slate-600">Адміністрування</p>
          </div>
          <button className="text-sm font-semibold text-slate-700 hover:text-emerald-700" onClick={() => void signOut()} type="button">
            Вийти
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] sm:px-6">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col lg:overflow-visible" aria-label="Адміністративна навігація">
          {navigation.map(([to, label]) => (
            <NavLink
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
              end={to === '/'}
              key={to}
              to={`/admin${to}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
