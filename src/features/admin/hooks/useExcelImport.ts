import { useCallback, useState } from 'react';
import {
  batchImport,
  parseExcel,
  previewImport,
  validateExcel,
} from '@/features/admin/api/excelImportRepository';
import type { AdminUser, SchoolClass } from '@/features/admin/types/admin.types';
import type {
  ImportMode,
  ImportPreview,
  ImportResult,
  ImportRow,
  ValidationError,
} from '@/features/admin/types/import.types';

type ImportPhase = 'idle' | 'parsed' | 'validated' | 'previewed' | 'importing' | 'done';

type ImportState = {
  phase: ImportPhase;
  file: File | null;
  rows: ImportRow[];
  errors: ValidationError[];
  preview: ImportPreview | null;
  progress: number;
  result: ImportResult | null;
  parseError: string | null;
};

const initialState: ImportState = {
  phase: 'idle',
  file: null,
  rows: [],
  errors: [],
  preview: null,
  progress: 0,
  result: null,
  parseError: null,
};

export function useExcelImport(classes: SchoolClass[], existingUsers: AdminUser[], actorId: string) {
  const [state, setState] = useState<ImportState>(initialState);
  const [mode, setMode] = useState<ImportMode>('both');

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setState({ ...initialState, file, phase: 'idle' });
      try {
        const rows = await parseExcel(file);
        const errors = validateExcel(rows, classes);
        const preview = previewImport(rows, classes, existingUsers);
        setState((previous) => ({
          ...previous,
          rows,
          errors,
          preview: { ...preview, errors },
          phase: errors.length > 0 ? 'validated' : 'previewed',
          parseError: null,
        }));
      } catch (error) {
        setState((previous) => ({
          ...previous,
          phase: 'idle',
          parseError: error instanceof Error ? error.message : 'Не вдалося прочитати файл.',
        }));
      }
    },
    [classes, existingUsers],
  );

  const updateMode = useCallback(
    (newMode: ImportMode) => {
      setMode(newMode);
      if (state.rows.length > 0) {
        const errors = validateExcel(state.rows, classes);
        const preview = previewImport(state.rows, classes, existingUsers);
        setState((previous) => ({
          ...previous,
          errors,
          preview: { ...preview, errors },
          phase: errors.length > 0 ? 'validated' : 'previewed',
        }));
      }
    },
    [state.rows, classes, existingUsers],
  );

  const startImport = useCallback(async () => {
    if (!state.preview) return;
    setState((previous) => ({ ...previous, phase: 'importing', progress: 0 }));
    try {
      const result = await batchImport(
        state.preview,
        classes,
        existingUsers,
        mode,
        actorId,
        (progress) => setState((previous) => ({ ...previous, progress })),
      );
      setState((previous) => ({ ...previous, phase: 'done', result, progress: 100 }));
    } catch {
      setState((previous) => ({
        ...previous,
        phase: 'previewed',
        parseError: 'Не вдалося виконати імпорт. Спробуйте ще раз.',
      }));
    }
  }, [state.preview, classes, existingUsers, mode, actorId]);

  const canImport =
    state.errors.length === 0 &&
    state.preview !== null &&
    state.phase === 'previewed' &&
    (state.preview.newUsers.length > 0 || state.preview.existingUsers.length > 0);

  return {
    ...state,
    mode,
    canImport,
    upload,
    updateMode,
    startImport,
    reset,
  };
}
