import { useQuery } from '@tanstack/react-query'

import { StatusView } from '../../components/admin/StatusView'
import { listLogs } from '../../repositories/admin/logsRepository'

const formatDateTime = (date: Date | null) => (date ? date.toLocaleString('uk-UA') : '—')

export const AdminLogsPage = () => {
  const logsQuery = useQuery({
    queryKey: ['admin-logs'],
    queryFn: listLogs,
  })

  return (
    <div className="admin-page-grid single-column">
      <div className="admin-card">
        <h2>Логи</h2>
        {logsQuery.isLoading ? <StatusView title="Завантаження логів..." /> : null}
        {logsQuery.isError ? <StatusView title="Не вдалося завантажити логи" /> : null}
        {!logsQuery.isLoading && !logsQuery.isError && (logsQuery.data?.length ?? 0) === 0 ? (
          <StatusView title="Логи відсутні" />
        ) : null}

        {!logsQuery.isLoading && !logsQuery.isError && (logsQuery.data?.length ?? 0) > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Користувач</th>
                  <th>Дія</th>
                  <th>Ціль</th>
                  <th>Деталі</th>
                </tr>
              </thead>
              <tbody>
                {(logsQuery.data ?? []).map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.date)}</td>
                    <td>{item.user || '—'}</td>
                    <td>{item.action || '—'}</td>
                    <td>{item.target || '—'}</td>
                    <td>{item.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
