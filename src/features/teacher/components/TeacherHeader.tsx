import { useAuth } from '@/features/auth/hooks/useAuth';

type TeacherHeaderProps = {
  teacherName: string;
  className: string;
  todayLabel: string;
};

export function TeacherHeader({ teacherName, className, todayLabel }: TeacherHeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">LunchPoint</p>
          <p className="text-base font-bold text-slate-900">{teacherName}</p>
          <p className="text-sm text-slate-600">
            {className} · {todayLabel}
          </p>
        </div>
        <button
          className="text-sm font-semibold text-slate-700 hover:text-emerald-700"
          onClick={() => void signOut()}
          type="button"
        >
          Вийти
        </button>
      </div>
    </header>
  );
}
