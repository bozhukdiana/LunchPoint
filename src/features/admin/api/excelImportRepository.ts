import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { AdminUser, SchoolClass } from '@/features/admin/types/admin.types';
import type {
  ImportMode,
  ImportPreview,
  ImportResult,
  ImportRow,
  ValidatedImportRow,
  ValidationError,
} from '@/features/admin/types/import.types';
import { userRoles } from '@/features/auth/types/auth.types';
import type { UserRole } from '@/features/auth/types/auth.types';
import { firestore } from '@/firebase/firestore';

const BATCH_SIZE = 400;
const ROLE_MAP: Record<string, UserRole> = {
  student: 'student',
  учень: 'student',
  учениця: 'student',
  teacher: 'teacher',
  учитель: 'teacher',
  вчитель: 'teacher',
  учителька: 'teacher',
  вчителька: 'teacher',
  admin: 'admin',
  адмін: 'admin',
  адміністратор: 'admin',
};

function cellString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('text' in obj) return String(obj['text']).trim();
  }
  return String(value).trim();
}

function cellBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const str = cellString(value).toUpperCase();
  return str === 'TRUE' || str === '1' || str === 'ТАК' || str === 'YES';
}

export async function parseExcel(file: File): Promise<ImportRow[]> {
  const { default: ExcelJS } = await import('exceljs');
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet('Users') ?? workbook.worksheets[0];
  if (!sheet) throw new Error('Не знайдено листа з даними.');

  const rows: ImportRow[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    let hasData = false;
    row.eachCell({ includeEmpty: false }, () => {
      hasData = true;
    });
    if (!hasData) return;

    const firstName = cellString(row.getCell(1).value);
    const lastName = cellString(row.getCell(2).value);
    const email = cellString(row.getCell(3).value);
    const role = cellString(row.getCell(4).value);
    const className = cellString(row.getCell(5).value);
    const active = cellBoolean(row.getCell(6).value);

    rows.push({ rowNumber, firstName, lastName, email, role, className, active });
  });

  return rows;
}

export function validateExcel(
  rows: ImportRow[],
  classes: SchoolClass[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenEmails = new Set<string>();
  const classNames = new Set(classes.map((c) => c.name));

  for (const row of rows) {
    const { rowNumber, firstName, lastName, email, role, className } = row;

    if (!firstName) errors.push({ row: rowNumber, column: "Ім'я", message: "Поле «Ім'я» обов'язкове." });
    if (!lastName) errors.push({ row: rowNumber, column: 'Прізвище', message: "Поле «Прізвище» обов'язкове." });

    if (!email) {
      errors.push({ row: rowNumber, column: 'Email', message: "Поле «Email» обов'язкове." });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: rowNumber, column: 'Email', message: `Некоректний формат Email: "${email}".` });
    } else if (seenEmails.has(email.toLowerCase())) {
      errors.push({ row: rowNumber, column: 'Email', message: `Дублікат Email у файлі: "${email}".` });
    } else {
      seenEmails.add(email.toLowerCase());
    }

    if (!role) {
      errors.push({ row: rowNumber, column: 'Роль', message: "Поле «Роль» обов'язкове." });
    } else {
      const normalized = ROLE_MAP[role.toLowerCase()];
      if (!normalized) {
        errors.push({
          row: rowNumber,
          column: 'Роль',
          message: `Невідома роль: "${role}". Допустимі: ${userRoles.join(', ')}.`,
        });
      } else if (normalized === 'student' && !className) {
        errors.push({ row: rowNumber, column: 'Клас', message: "Для учня обов'язково вкажіть клас." });
      } else if (className && !classNames.has(className)) {
        errors.push({ row: rowNumber, column: 'Клас', message: `Клас "${className}" не знайдено в системі.` });
      }
    }
  }

  return errors;
}

export function previewImport(
  rows: ImportRow[],
  classes: SchoolClass[],
  existingUsers: AdminUser[],
): ImportPreview {
  const existingByEmail = new Map(existingUsers.map((u) => [u.email?.toLowerCase() ?? '', u]));
  const newUsers: ValidatedImportRow[] = [];
  const existingUsersFiltered: ValidatedImportRow[] = [];
  const skippedRows: number[] = [];

  for (const row of rows) {
    const { rowNumber, firstName, lastName, email, role, className, active } = row;
    const resolvedRole = ROLE_MAP[role.toLowerCase()] as UserRole | undefined;
    if (!resolvedRole || !email || !firstName || !lastName) {
      skippedRows.push(rowNumber);
      continue;
    }

    const displayName = `${firstName} ${lastName}`;
    const validated: ValidatedImportRow = {
      rowNumber,
      firstName,
      lastName,
      email,
      role: resolvedRole,
      className,
      active,
      displayName,
    };

    if (existingByEmail.has(email.toLowerCase())) {
      existingUsersFiltered.push(validated);
    } else {
      newUsers.push(validated);
    }
  }

  return {
    totalRows: rows.length,
    newUsers,
    existingUsers: existingUsersFiltered,
    skippedRows,
    errors: [],
  };
}

function logRef() {
  return doc(collection(firestore, 'logs'));
}

async function commitBatches(
  operations: ((batch: ReturnType<typeof writeBatch>) => void)[],
  onProgress: (progress: number) => void,
): Promise<void> {
  const chunks: ((batch: ReturnType<typeof writeBatch>) => void)[][] = [];
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    chunks.push(operations.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    const batch = writeBatch(firestore);
    for (const op of chunks[i]) op(batch);
    await batch.commit();
    onProgress(Math.round(((i + 1) / chunks.length) * 100));
  }
}

export async function batchImport(
  preview: ImportPreview,
  classes: SchoolClass[],
  existingUsers: AdminUser[],
  mode: ImportMode,
  actorId: string,
  onProgress: (progress: number) => void,
): Promise<ImportResult> {
  const classMap = new Map(classes.map((c) => [c.name, c.id]));
  const existingByEmail = new Map(existingUsers.map((u) => [u.email?.toLowerCase() ?? '', u]));

  const operations: ((batch: ReturnType<typeof writeBatch>) => void)[] = [];
  let created = 0;
  let updated = 0;

  const toCreate = mode === 'update' ? [] : preview.newUsers;
  const toUpdate = mode === 'create' ? [] : preview.existingUsers;
  const toSkip =
    (mode === 'create' ? preview.existingUsers.length : mode === 'update' ? preview.newUsers.length : 0) +
    preview.skippedRows.length;

  for (const row of toCreate) {
    const newDocRef = doc(collection(firestore, 'users'));
    const classId = classMap.get(row.className) ?? null;
    operations.push((batch) => {
      batch.set(newDocRef, {
        displayName: row.displayName,
        email: row.email,
        role: row.role,
        classId,
        active: row.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    operations.push((batch) => {
      batch.set(logRef(), {
        actorId,
        action: 'user.importCreated',
        entityType: 'user',
        entityId: newDocRef.id,
        metadata: { email: row.email, role: row.role },
        createdAt: serverTimestamp(),
      });
    });
    created++;
  }

  for (const row of toUpdate) {
    const existing = existingByEmail.get(row.email.toLowerCase());
    if (!existing) continue;
    const classId = classMap.get(row.className) ?? null;
    operations.push((batch) => {
      batch.update(doc(firestore, 'users', existing.uid), {
        displayName: row.displayName,
        email: row.email,
        role: row.role,
        classId,
        active: row.active,
        updatedAt: serverTimestamp(),
      });
    });
    operations.push((batch) => {
      batch.set(logRef(), {
        actorId,
        action: 'user.importUpdated',
        entityType: 'user',
        entityId: existing.uid,
        metadata: { email: row.email, role: row.role },
        createdAt: serverTimestamp(),
      });
    });
    updated++;
  }

  if (operations.length === 0) {
    onProgress(100);
    return { created, updated, skipped: toSkip, errors: 0 };
  }

  await commitBatches(operations, onProgress);

  return { created, updated, skipped: toSkip, errors: 0 };
}

export async function downloadTemplate(): Promise<void> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const usersSheet = workbook.addWorksheet('Users');
  usersSheet.columns = [
    { header: "Ім'я", key: 'firstName', width: 20 },
    { header: 'Прізвище', key: 'lastName', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Роль', key: 'role', width: 15 },
    { header: 'Клас', key: 'className', width: 12 },
    { header: 'Активний', key: 'active', width: 12 },
  ];

  const headerRow = usersSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };

  usersSheet.addRow({ firstName: 'Іван', lastName: 'Петренко', email: 'ivan@school.com', role: 'student', className: '7-А', active: true });
  usersSheet.addRow({ firstName: 'Марія', lastName: 'Іванюк', email: 'maria@school.com', role: 'teacher', className: '', active: true });
  usersSheet.addRow({ firstName: 'Олена', lastName: 'Коваль', email: 'olena@school.com', role: 'admin', className: '', active: true });

  const instructionsSheet = workbook.addWorksheet('Instructions');
  instructionsSheet.getColumn(1).width = 80;
  const instructions = [
    'Інструкція з імпорту користувачів LunchPoint',
    '',
    'Заповніть лист «Users» відповідно до формату:',
    "Стовпець A — Ім'я (обов'язково)",
    "Стовпець B — Прізвище (обов'язково)",
    "Стовпець C — Email (обов'язково, унікальний)",
    "Стовпець D — Роль: student / teacher / admin (обов'язково)",
    "Стовпець E — Клас (обов'язково для учнів, назва має збігатися з класами в системі)",
    'Стовпець F — Активний: TRUE / FALSE (TRUE за замовчуванням)',
    '',
    'Допустимі значення ролей:',
    '  student — учень',
    '  teacher — учитель',
    '  admin — адміністратор',
    '',
    'Примітки:',
    '• Рядок 1 — заголовок, не видаляйте його.',
    '• Порожні рядки ігноруються.',
    '• Email має бути унікальним у файлі та в системі (або оберіть режим «Оновити існуючих»).',
    '• Максимальна кількість рядків: 1000+.',
  ];
  for (const text of instructions) {
    instructionsSheet.addRow([text]);
  }
  instructionsSheet.getRow(1).font = { bold: true, size: 14 };

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, 'LunchPoint_ImportTemplate.xlsx');
}

export async function downloadErrorFile(errors: ValidationError[]): Promise<void> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Errors');
  sheet.columns = [
    { header: 'Рядок', key: 'row', width: 10 },
    { header: 'Стовпець', key: 'column', width: 20 },
    { header: 'Помилка', key: 'message', width: 60 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };

  for (const error of errors) {
    sheet.addRow({ row: error.row, column: error.column, message: error.message });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, 'ImportErrors.xlsx');
}

function triggerDownload(buffer: BlobPart, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
