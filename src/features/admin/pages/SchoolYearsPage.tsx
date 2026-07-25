import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState, MutationError } from '@/features/admin/components/AsyncState';
import { useActivateSchoolYear, useArchiveSchoolYear, useCreateSchoolYear, useSchoolYears } from '@/features/admin/hooks/useAdminData';
import { schoolYearFormSchema } from '@/features/admin/schemas/adminSchemas';
import type { SchoolYearFormValues } from '@/features/admin/schemas/adminSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';

const initialValues: SchoolYearFormValues = { name: '', startDate: '', endDate: '' };

export function SchoolYearsPage() {
  const { profile } = useAuth(); const yearsQuery = useSchoolYears(); const createMutation = useCreateSchoolYear(profile!.uid); const activateMutation = useActivateSchoolYear(profile!.uid); const archiveMutation = useArchiveSchoolYear(profile!.uid);
  const form = useForm<SchoolYearFormValues>({ resolver: zodResolver(schoolYearFormSchema), defaultValues: initialValues });
  if (yearsQuery.isPending) return <LoadingState />; if (yearsQuery.isError) return <ErrorState />;
  const submit = async (values: SchoolYearFormValues) => { await createMutation.mutateAsync(values); form.reset(initialValues); };
  const mutationError = createMutation.error ?? activateMutation.error ?? archiveMutation.error;
  return <AdminPage description="Лише один навчальний рік може бути активним одночасно." title="Навчальні роки"><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Назва</th><th className="p-3">Період</th><th className="p-3">Стан</th><th className="p-3">Дії</th></tr></thead><tbody>{yearsQuery.data?.map((year) => <tr className="border-t border-slate-100" key={year.id}><td className="p-3 font-medium">{year.name}</td><td className="p-3">{year.startDate} — {year.endDate}</td><td className="p-3">{year.active ? 'Активний' : year.archived ? 'Архів' : 'Неактивний'}</td><td className="p-3">{!year.active && !year.archived && <button className="mr-3 font-medium text-emerald-700" onClick={() => void activateMutation.mutateAsync(year.id)} type="button">Активувати</button>}{!year.archived && <button className="font-medium text-slate-700" onClick={() => void archiveMutation.mutateAsync(year.id)} type="button">Архівувати</button>}</td></tr>)}</tbody></table></section><form className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={form.handleSubmit((values) => void submit(values))}><h2 className="font-bold">Створити навчальний рік</h2><div className="mt-4 space-y-3"><label className="block text-sm font-medium">Назва<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="2026–2027" {...form.register('name')} /></label><label className="block text-sm font-medium">Початок<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="date" {...form.register('startDate')} /></label><label className="block text-sm font-medium">Завершення<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="date" {...form.register('endDate')} /></label></div>{Object.values(form.formState.errors).map((error) => <p className="mt-2 text-sm text-red-700" key={error.message}>{error.message}</p>)}{mutationError && <MutationError />}<button className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60" disabled={createMutation.isPending} type="submit">Створити</button></form></div></AdminPage>;
}
