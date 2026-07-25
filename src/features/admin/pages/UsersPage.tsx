import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState, MutationError } from '@/features/admin/components/AsyncState';
import { useClasses, useCreateUser, useSetUserActive, useUpdateUser, useAdminUsers } from '@/features/admin/hooks/useAdminData';
import { userFormSchema } from '@/features/admin/schemas/adminSchemas';
import type { UserFormValues } from '@/features/admin/schemas/adminSchemas';
import type { AdminUser } from '@/features/admin/types/admin.types';
import { useAuth } from '@/features/auth/hooks/useAuth';

const initialValues: UserFormValues = { uid: '', displayName: '', email: '', role: 'student', classId: '' };

export function UsersPage() {
  const { profile } = useAuth();
  const usersQuery = useAdminUsers();
  const classesQuery = useClasses();
  const createMutation = useCreateUser(profile!.uid);
  const updateMutation = useUpdateUser(profile!.uid);
  const activationMutation = useSetUserActive(profile!.uid);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const form = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues: initialValues });

  const visibleUsers = useMemo(
    () =>
      (usersQuery.data ?? []).filter((user) => {
        const query = search.toLowerCase().trim();
        const matchesSearch = !query || `${user.displayName} ${user.email ?? ''} ${user.uid}`.toLowerCase().includes(query);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesActive = activeFilter === 'all' || String(user.active) === activeFilter;
        return matchesSearch && matchesRole && matchesActive;
      }),
    [activeFilter, roleFilter, search, usersQuery.data],
  );

  const startCreate = () => {
    setEditingUser(null);
    form.reset(initialValues);
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    form.reset({ uid: user.uid, displayName: user.displayName, email: user.email ?? '', role: user.role, classId: user.classId ?? '' });
  };

  const submit = async (values: UserFormValues) => {
    if (editingUser) {
      await updateMutation.mutateAsync({
        uid: editingUser.uid,
        values: {
          displayName: values.displayName,
          email: values.email,
          role: values.role,
          classId: values.classId,
        },
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    startCreate();
  };

  if (usersQuery.isPending || classesQuery.isPending) return <LoadingState />;
  if (usersQuery.isError || classesQuery.isError) return <ErrorState />;

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error ?? activationMutation.error;

  return (
    <AdminPage description="Створюйте профілі доступу та призначайте ролі й класи." title="Користувачі">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <input className="rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => setSearch(event.target.value)} placeholder="Пошук" value={search} />
            <select className="rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
              <option value="all">Усі ролі</option><option value="student">Учні</option><option value="teacher">Учителі</option><option value="admin">Адміністратори</option>
            </select>
            <select className="rounded-lg border border-slate-300 px-3 py-2" onChange={(event) => setActiveFilter(event.target.value)} value={activeFilter}>
              <option value="all">Усі стани</option><option value="true">Активні</option><option value="false">Неактивні</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Користувач</th><th className="p-3">Роль</th><th className="p-3">Клас</th><th className="p-3">Стан</th><th className="p-3">Дії</th></tr></thead>
              <tbody>{visibleUsers.map((user) => <tr className="border-t border-slate-100" key={user.uid}><td className="p-3"><p className="font-medium">{user.displayName}</p><p className="text-slate-500">{user.email || user.uid}</p></td><td className="p-3">{user.role}</td><td className="p-3">{classesQuery.data?.find((item) => item.id === user.classId)?.name ?? '—'}</td><td className="p-3">{user.active ? 'Активний' : 'Неактивний'}</td><td className="p-3"><div className="flex gap-2"><button className="font-medium text-emerald-700" onClick={() => startEdit(user)} type="button">Редагувати</button><button className="font-medium text-slate-700" disabled={activationMutation.isPending} onClick={() => void activationMutation.mutateAsync({ uid: user.uid, active: !user.active })} type="button">{user.active ? 'Деактивувати' : 'Активувати'}</button></div></td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <form className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={form.handleSubmit((values) => void submit(values))}>
          <div className="flex items-center justify-between"><h2 className="font-bold">{editingUser ? 'Редагувати користувача' : 'Створити профіль'}</h2>{editingUser && <button className="text-sm text-slate-600" onClick={startCreate} type="button">Скасувати</button>}</div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">Google UID<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100" disabled={Boolean(editingUser)} {...form.register('uid')} /></label>
            <label className="block text-sm font-medium">Повне ім’я<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('displayName')} /></label>
            <label className="block text-sm font-medium">Електронна пошта<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('email')} /></label>
            <label className="block text-sm font-medium">Роль<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('role')}><option value="student">Учень</option><option value="teacher">Учитель</option><option value="admin">Адміністратор</option></select></label>
            <label className="block text-sm font-medium">Клас<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('classId')}><option value="">Не призначено</option>{classesQuery.data?.filter((item) => !item.archived).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          </div>
          {Object.values(form.formState.errors).map((error) => <p className="mt-2 text-sm text-red-700" key={error.message}>{error.message}</p>)}
          {mutationError && <MutationError />}
          <button className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Збереження…' : editingUser ? 'Зберегти зміни' : 'Створити профіль'}</button>
        </form>
      </div>
    </AdminPage>
  );
}
