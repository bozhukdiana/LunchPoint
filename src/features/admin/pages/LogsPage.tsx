import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState } from '@/features/admin/components/AsyncState';
import { useLogs } from '@/features/admin/hooks/useAdminData';

function formatDate(value?: { toDate: () => Date }) { return value ? new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'medium' }).format(value.toDate()) : 'Щойно'; }

export function LogsPage() {
  const logsQuery = useLogs(); if (logsQuery.isPending) return <LoadingState />; if (logsQuery.isError) return <ErrorState />;
  return <AdminPage description="Незмінний журнал адміністративних операцій. Нові записи відображаються першими." title="Журнал змін"><div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Час</th><th className="p-3">Дія</th><th className="p-3">Сутність</th><th className="p-3">Виконавець</th></tr></thead><tbody>{logsQuery.data?.map((log) => <tr className="border-t border-slate-100" key={log.id}><td className="p-3 text-slate-600">{formatDate(log.createdAt)}</td><td className="p-3 font-medium">{log.action}</td><td className="p-3">{log.entityType}: {log.entityId}</td><td className="p-3 font-mono text-xs">{log.actorId}</td></tr>)}</tbody></table></div></AdminPage>;
}
