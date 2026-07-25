type TeacherSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TeacherSearch({ value, onChange }: TeacherSearchProps) {
  return (
    <div>
      <label className="sr-only" htmlFor="teacher-search">
        Пошук учнів
      </label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        id="teacher-search"
        placeholder="Пошук за прізвищем або ім'ям…"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
