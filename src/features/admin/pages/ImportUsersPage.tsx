import { AdminPage } from '@/features/admin/components/AdminPage';
import { ErrorState, LoadingState } from '@/features/admin/components/AsyncState';
import { DownloadTemplateButton } from '@/features/admin/components/import/DownloadTemplateButton';
import { ExcelPreview } from '@/features/admin/components/import/ExcelPreview';
import { ImportButton } from '@/features/admin/components/import/ImportButton';
import { ImportHeader } from '@/features/admin/components/import/ImportHeader';
import { ImportProgress } from '@/features/admin/components/import/ImportProgress';
import { ImportResult } from '@/features/admin/components/import/ImportResult';
import { ImportStatistics } from '@/features/admin/components/import/ImportStatistics';
import { UploadArea } from '@/features/admin/components/import/UploadArea';
import { ValidationSummary } from '@/features/admin/components/import/ValidationSummary';
import { useAdminUsers, useClasses } from '@/features/admin/hooks/useAdminData';
import { useExcelImport } from '@/features/admin/hooks/useExcelImport';
import { downloadErrorFile } from '@/features/admin/api/excelImportRepository';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ImportMode } from '@/features/admin/types/import.types';

const MODE_OPTIONS: { value: ImportMode; label: string; description: string }[] = [
  { value: 'create', label: 'Тільки нові', description: 'Створити лише нових користувачів, ігнорувати існуючих.' },
  { value: 'update', label: 'Тільки існуючі', description: 'Оновити лише існуючих користувачів, ігнорувати нових.' },
  { value: 'both', label: 'Нові + існуючі', description: 'Створити нових та оновити існуючих.' },
];

export function ImportUsersPage() {
  const { profile } = useAuth();
  const classesQuery = useClasses();
  const usersQuery = useAdminUsers();

  const {
    phase,
    file,
    errors,
    preview,
    progress,
    result,
    parseError,
    mode,
    canImport,
    upload,
    updateMode,
    startImport,
    reset,
  } = useExcelImport(classesQuery.data ?? [], usersQuery.data ?? [], profile!.uid);

  if (classesQuery.isPending || usersQuery.isPending) return <LoadingState />;
  if (classesQuery.isError || usersQuery.isError) return <ErrorState />;

  const handleDownloadErrors = async () => {
    await downloadErrorFile(errors);
  };

  return (
    <AdminPage description="Масове додавання або оновлення користувачів через Excel-файл." title="">
      <div className="space-y-6">
        <ImportHeader hasFile={Boolean(file)} onReset={reset} />

        {/* Download template + mode selector */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Режим імпорту</p>
            <div className="flex flex-wrap gap-2">
              {MODE_OPTIONS.map((option) => (
                <button
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    mode === option.value
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  key={option.value}
                  onClick={() => updateMode(option.value)}
                  title={option.description}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {MODE_OPTIONS.find((o) => o.value === mode)?.description}
            </p>
          </div>
          <DownloadTemplateButton />
        </div>

        {/* Parse error */}
        {parseError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {parseError}
          </p>
        )}

        {/* Upload area — shown if no file yet */}
        {phase === 'idle' && (
          <UploadArea onFile={(f) => void upload(f)} />
        )}

        {/* Results after import */}
        {phase === 'done' && result && <ImportResult onReset={reset} result={result} />}

        {/* Progress bar during import */}
        {phase === 'importing' && <ImportProgress progress={progress} />}

        {/* Preview content */}
        {(phase === 'validated' || phase === 'previewed') && preview && (
          <>
            <ImportStatistics preview={preview} />
            <ValidationSummary errors={errors} onDownloadErrors={() => void handleDownloadErrors()} />
            <ExcelPreview existingUsers={preview.existingUsers} newUsers={preview.newUsers} />
            <div className="flex justify-end">
              <ImportButton
                canImport={canImport}
                isImporting={false}
                onImport={() => void startImport()}
              />
            </div>
          </>
        )}
      </div>
    </AdminPage>
  );
}
