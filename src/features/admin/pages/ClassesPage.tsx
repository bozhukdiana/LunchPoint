import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState, MutationError } from '@/features/admin/components/AsyncState';
import { useAdminUsers, useArchiveClass, useClasses, useCreateClass, useSchoolYears, useUpdateClass } from '@/features/admin/hooks/useAdminData';
import { classFormSchema } from '@/features/admin/schemas/adminSchemas';
import type { ClassFormValues } from '@/features/admin/schemas/adminSchemas';
import type { SchoolClass } from '@/features/admin/types/admin.types';
import { useAuth } from '@/features/auth/hooks/useAuth';

const initialValues: ClassFormValues = { name: '', teacherId: '', schoolYearId: '' };

export function ClassesPage() {
  const { profile } = useAuth();
  const classesQuery = useClasses();
  const usersQuery = useAdminUsers();
  const yearsQuery = useSchoolYears();
  const createMutation = useCreateClass(profile!.uid);
  const updateMutation = useUpdateClass(profile!.uid);
  const archiveMutation = useArchiveClass(profile!.uid);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const form = useForm<ClassFormValues>({ resolver: zodResolver(classFormSchema), defaultValues: initialValues });
  const teachers = (usersQuery.data ?? []).filter((user) => user.role === 'teacher' && user.active);

  const submit = async (values: ClassFormValues) => {
    if (editingClass) await updateMutation.mutateAsync({ id: editingClass.id, values });
    else await createMutation.mutateAsync(values);
    setEditingClass(null); form.reset(initialValues);
  };

  if (classesQuery.isPending || usersQuery.isPending || yearsQuery.isPending) return <LoadingState />;
  if (classesQuery.isError || usersQuery.isError || yearsQuery.isError) return <ErrorState />;
  const mutationError = createMutation.error ?? updateMutation.error ?? archiveMutation.error;

  return <AdminPage description="Створюйте класи, призначайте класних керівників та архівуйте неактуальні." title="Класи">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Клас</th><th className="p-3">Учитель</th><th className="p-3">Навчальний рік</th><th className="p-3">Стан</th><th className="p-3">Дії</th></tr></thead><tbody>{classesQuery.data?.map((schoolClass) => <tr className="border-t border-slate-100" key={schoolClass.id}><td className="p-3 font-medium">{schoolClass.name}</td><td className="p-3">{teachers.find((user) => user.uid === schoolClass.teacherId)?.displayName ?? '—'}</td><td className="p-3">{yearsQuery.data?.find((year) => year.id === schoolClass.schoolYearId)?.name ?? '—'}</td><td className="p-3">{schoolClass.archived ? 'Архів' : 'Активний'}</td><td className="p-3"><button className="mr-3 font-medium text-emerald-700" onClick={() => { setEditingClass(schoolClass); form.reset({ name: schoolClass.name, teacherId: schoolClass.teacherId ?? '', schoolYearId: schoolClass.schoolYearId ?? '' }); }} type="button">Редагувати</button>{!schoolClass.archived && <button className="font-medium text-slate-700" onClick={() => void archiveMutation.mutateAsync(schoolClass.id)} type="button">Архівувати</button>}</td></tr>)}</tbody></table></section>
      <form className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={form.handleSubmit((values) => void submit(values))}><div className="flex justify-between"><h2 className="font-bold">{editingClass ? 'Редагувати клас' : 'Створити клас'}</h2>{editingClass && <button className="text-sm" onClick={() => { setEditingClass(null); form.reset(initialValues); }} type="button">Скасувати</button>}</div><div className="mt-4 space-y-3"><label className="block text-sm font-medium">Назва<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('name')} /></label><label className="block text-sm font-medium">Класний керівник<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('teacherId')}><option value="">Не призначено</option>{teachers.map((teacher) => <option key={teacher.uid} value={teacher.uid}>{teacher.displayName}</option>)}</select></label><label className="block text-sm font-medium">Навчальний рік<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('schoolYearId')}><option value="">Не призначено</option>{yearsQuery.data?.filter((year) => !year.archived).map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label></div>{Object.values(form.formState.errors).map((error) => <p className="mt-2 text-sm text-red-700" key={error.message}>{error.message}</p>)}{mutationError && <MutationError />}<button className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60" disabled={createMutation.isPending || updateMutation.isPending} type="submit">Зберегти</button></form></div>
  </AdminPage>;
}
