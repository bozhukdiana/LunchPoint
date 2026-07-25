import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState, MutationError } from '@/features/admin/components/AsyncState';
import { useSaveSettings, useSettings } from '@/features/admin/hooks/useAdminData';
import { settingsFormSchema } from '@/features/admin/schemas/adminSchemas';
import type { SettingsFormValues } from '@/features/admin/schemas/adminSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';

const defaults: SettingsFormValues = { schoolName: 'Ліцей №1 м. Копичинці', applicationName: 'LunchPoint', mealStartTime: '10:00', mealEndTime: '14:00', logoUrl: '' };

export function SettingsPage() {
  const { profile } = useAuth(); const settingsQuery = useSettings(); const saveMutation = useSaveSettings(profile!.uid);
  const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues: defaults });
  useEffect(() => { if (settingsQuery.data) form.reset({ ...defaults, ...settingsQuery.data, logoUrl: settingsQuery.data.logoUrl ?? '' }); }, [form, settingsQuery.data]);
  if (settingsQuery.isPending) return <LoadingState />; if (settingsQuery.isError) return <ErrorState />;
  const submit = async (values: SettingsFormValues) => { await saveMutation.mutateAsync(values); };
  return <AdminPage description="Налаштування закладу та доступного часу редагування обліку харчування." title="Налаштування"><form className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={form.handleSubmit((values) => void submit(values))}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium sm:col-span-2">Назва закладу<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('schoolName')} /></label><label className="block text-sm font-medium">Назва застосунку<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...form.register('applicationName')} /></label><label className="block text-sm font-medium">Логотип (URL)<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Завантаження файлу буде додано пізніше" {...form.register('logoUrl')} /></label><label className="block text-sm font-medium">Початок часу харчування<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="time" {...form.register('mealStartTime')} /></label><label className="block text-sm font-medium">Завершення часу харчування<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="time" {...form.register('mealEndTime')} /></label></div><p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Завантаження файлу логотипу — запланована функція. Наразі можна зберегти URL логотипу.</p>{Object.values(form.formState.errors).map((error) => <p className="mt-2 text-sm text-red-700" key={error.message}>{error.message}</p>)}{saveMutation.error && <MutationError />}<button className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60" disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? 'Збереження…' : 'Зберегти налаштування'}</button></form></AdminPage>;
}
