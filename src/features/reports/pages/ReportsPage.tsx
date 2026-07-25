import { useCallback, useMemo, useState } from 'react';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { useClasses, useSchoolYears, useAdminUsers } from '@/features/admin/hooks/useAdminData';
import {
  BarChartCard,
  ClassStatistics,
  DailyTable,
  EmptyState,
  ErrorState,
  ExportButtons,
  LoadingState,
  PieChartCard,
  ReportsFilters,
  SchoolStatistics,
  StatisticCards,
} from '@/features/reports/components';
import {
  useClassReport,
  useDailyReport,
  useReportStatistics,
  useSchoolReport,
} from '@/features/reports/hooks/useReportsData';
import type { ReportFilters } from '@/features/reports/types/reports.types';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultDateFrom(): string {
  return new Date(Date.now() - THIRTY_DAYS_MS).toISOString().slice(0, 10);
}

const TABS = ['Щоденний', 'За класом', 'Школа'] as const;
type TabKey = (typeof TABS)[number];

export function ReportsPage() {
  const today = useMemo(() => getTodayString(), []);
  const defaultFrom = useMemo(() => getDefaultDateFrom(), []);

  const [activeTab, setActiveTab] = useState<TabKey>('Щоденний');
  const [filters, setFilters] = useState<ReportFilters>({
    schoolYearId: '',
    classId: '',
    date: today,
    dateFrom: defaultFrom,
    dateTo: today,
    status: 'all',
    teacherId: '',
    search: '',
  });

  const updateFilters = useCallback((updated: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const schoolYearsQuery = useSchoolYears();
  const classesQuery = useClasses();
  const usersQuery = useAdminUsers();

  const statsQuery = useReportStatistics({ date: filters.date, classId: filters.classId });
  const dailyQuery = useDailyReport(filters);
  const classQuery = useClassReport(filters);
  const schoolQuery = useSchoolReport(filters);

  const teachers = useMemo(
    () => (usersQuery.data ?? []).filter((u) => u.role === 'teacher' && u.active),
    [usersQuery.data],
  );

  const isBaseLoading = schoolYearsQuery.isPending || classesQuery.isPending || usersQuery.isPending;
  if (isBaseLoading) return <LoadingState />;
  if (schoolYearsQuery.isError || classesQuery.isError) return <ErrorState />;

  const schoolYears = schoolYearsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  const dailyRows = dailyQuery.data ?? [];

  const pieData = statsQuery.data
    ? [
        { name: 'Харчується', value: statsQuery.data.meal },
        { name: 'Не харчується', value: statsQuery.data.noMeal },
        { name: 'Відсутній', value: statsQuery.data.absent },
        { name: 'Очікується', value: statsQuery.data.pending },
      ]
    : [];

  return (
    <AdminPage
      actions={<ExportButtons filters={filters} rows={dailyRows} />}
      description={`Звітність за ${filters.date}`}
      title="Звіти"
    >
      <div className="space-y-6">
        <ReportsFilters
          classes={classes}
          filters={filters}
          onChange={updateFilters}
          schoolYears={schoolYears}
          teachers={teachers}
        />

        {statsQuery.isPending ? (
          <LoadingState />
        ) : statsQuery.isError ? (
          <ErrorState />
        ) : statsQuery.data ? (
          <StatisticCards stats={statsQuery.data} />
        ) : (
          <EmptyState />
        )}

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
          {TABS.map((tab) => (
            <button
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Щоденний' && (
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {statsQuery.data && pieData.some((d) => d.value > 0) ? (
                <PieChartCard data={pieData} title="Розподіл за статусом" />
              ) : null}
              {dailyQuery.data && dailyQuery.data.length > 0 ? (
                <BarChartCard
                  bars={[
                    { key: 'value', color: '#059669', label: 'Учнів' },
                  ]}
                  data={pieData}
                  title="Підсумок дня"
                  xAxisKey="name"
                />
              ) : null}
            </div>
            {dailyQuery.isPending ? (
              <LoadingState />
            ) : dailyQuery.isError ? (
              <ErrorState />
            ) : (
              <DailyTable rows={dailyRows} />
            )}
          </section>
        )}

        {activeTab === 'За класом' && (
          <section>
            {classQuery.isPending ? (
              <LoadingState />
            ) : classQuery.isError ? (
              <ErrorState />
            ) : classQuery.data ? (
              <ClassStatistics data={classQuery.data} />
            ) : (
              <EmptyState />
            )}
          </section>
        )}

        {activeTab === 'Школа' && (
          <section>
            {schoolQuery.isPending ? (
              <LoadingState />
            ) : schoolQuery.isError ? (
              <ErrorState />
            ) : schoolQuery.data ? (
              <SchoolStatistics data={schoolQuery.data} />
            ) : (
              <EmptyState />
            )}
          </section>
        )}
      </div>
    </AdminPage>
  );
}
