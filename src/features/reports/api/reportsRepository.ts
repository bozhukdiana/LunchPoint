import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import type { AdminUser, SchoolClass } from '@/features/admin/types/admin.types';
import type { MealRecord } from '@/features/student/types/student.types';
import type {
  ClassReportData,
  DailyReportRow,
  DailyTotals,
  ReportFilters,
  ReportStatistics,
  SchoolReportData,
} from '@/features/reports/types/reports.types';
import { firestore } from '@/firebase/firestore';

const db = {
  users: collection(firestore, 'users'),
  classes: collection(firestore, 'classes'),
  meals: collection(firestore, 'meals'),
};

async function fetchAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(query(db.users, orderBy('displayName')));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUser, 'uid'>) }));
}

async function fetchClasses(): Promise<SchoolClass[]> {
  const snap = await getDocs(query(db.classes, orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SchoolClass, 'id'>) }));
}

async function fetchMealsForDateRange(dateFrom: string, dateTo: string, classId?: string): Promise<MealRecord[]> {
  const constraints = [where('date', '>=', dateFrom), where('date', '<=', dateTo)];
  if (classId) constraints.push(where('classId', '==', classId));
  const snap = await getDocs(query(db.meals, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MealRecord, 'id'>) }));
}

async function fetchMealsForDate(date: string, classId?: string): Promise<MealRecord[]> {
  return fetchMealsForDateRange(date, date, classId);
}

function computePct(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export async function getStatistics(filters: Pick<ReportFilters, 'date' | 'classId'>): Promise<ReportStatistics> {
  const { date, classId } = filters;
  const [meals, users, classes] = await Promise.all([
    fetchMealsForDate(date, classId || undefined),
    fetchAllUsers(),
    fetchClasses(),
  ]);

  const students = users.filter((u) => u.active && u.role === 'student');
  const relevantStudents = classId
    ? students.filter((s) => s.classId === classId)
    : students;

  const relevantClassIds = new Set(
    classId
      ? [classId]
      : classes.filter((c) => !c.archived).map((c) => c.id),
  );
  const scopedStudents = relevantStudents.filter(
    (s) => !s.classId || relevantClassIds.has(s.classId),
  );

  const total = scopedStudents.length;
  const mealMap = new Map(meals.map((m) => [m.studentId, m.status]));

  let meal = 0;
  let noMeal = 0;
  let absent = 0;

  for (const s of scopedStudents) {
    const status = mealMap.get(s.uid);
    if (status === 'meal') meal++;
    else if (status === 'noMeal') noMeal++;
    else if (status === 'absent') absent++;
  }

  const pending = total - meal - noMeal - absent;

  return { date, total, meal, noMeal, absent, pending };
}

export async function getDailyReport(filters: ReportFilters): Promise<DailyReportRow[]> {
  const { date, classId, status, search, schoolYearId } = filters;

  const [users, classes, meals] = await Promise.all([
    fetchAllUsers(),
    fetchClasses(),
    fetchMealsForDate(date, classId || undefined),
  ]);

  const userMap = new Map(users.map((u) => [u.uid, u]));
  const classMap = new Map(classes.map((c) => [c.id, c]));

  const students = users.filter((u) => u.role === 'student' && u.active);
  const filteredStudents = classId ? students.filter((s) => s.classId === classId) : students;
  const yearFilteredStudents = schoolYearId
    ? filteredStudents.filter((s) => {
        const cls = s.classId ? classMap.get(s.classId) : null;
        return cls ? cls.schoolYearId === schoolYearId : false;
      })
    : filteredStudents;

  const mealMap = new Map(meals.map((m) => [m.studentId, m]));

  const rows: DailyReportRow[] = yearFilteredStudents.map((student) => {
    const meal = mealMap.get(student.uid);
    const cls = student.classId ? classMap.get(student.classId) : null;
    const updatedByUser = meal ? userMap.get(meal.updatedBy) : null;

    return {
      studentId: student.uid,
      studentName: student.displayName ?? '',
      className: cls?.name ?? '—',
      classId: student.classId ?? '',
      status: (meal?.status ?? 'pending') as DailyReportRow['status'],
      updatedAt: meal?.updatedAt,
      updatedBy: meal?.updatedBy ?? '',
      updatedByName: updatedByUser?.displayName ?? meal?.updatedBy ?? '—',
      date,
    };
  });

  return rows.filter((row) => {
    const matchesStatus = status === 'all' || row.status === status;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      row.studentName.toLowerCase().includes(term) ||
      row.className.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });
}

export async function getClassReport(filters: ReportFilters): Promise<ClassReportData[]> {
  const { date, schoolYearId, classId } = filters;

  const [users, classes, meals] = await Promise.all([
    fetchAllUsers(),
    fetchClasses(),
    fetchMealsForDate(date),
  ]);

  const mealMap = new Map(meals.map((m) => [m.studentId, m.status]));

  const activeClasses = classes.filter((c) => {
    if (c.archived) return false;
    if (classId && c.id !== classId) return false;
    if (schoolYearId && c.schoolYearId !== schoolYearId) return false;
    return true;
  });

  return activeClasses.map((cls): ClassReportData => {
    const classStudents = users.filter(
      (u) => u.role === 'student' && u.active && u.classId === cls.id,
    );
    const total = classStudents.length;
    let meal = 0;
    let noMeal = 0;
    let absent = 0;

    for (const s of classStudents) {
      const st = mealMap.get(s.uid);
      if (st === 'meal') meal++;
      else if (st === 'noMeal') noMeal++;
      else if (st === 'absent') absent++;
    }

    const pending = total - meal - noMeal - absent;

    return {
      classId: cls.id,
      className: cls.name,
      total,
      meal,
      noMeal,
      absent,
      pending,
      mealPct: computePct(meal, total),
      noMealPct: computePct(noMeal, total),
      absentPct: computePct(absent, total),
      pendingPct: computePct(pending, total),
    };
  });
}

function buildDailyTotals(dates: string[], students: AdminUser[], allMeals: MealRecord[]): DailyTotals[] {
  return dates.map((date) => {
    const dateMeals = allMeals.filter((m) => m.date === date);
    const mealMap = new Map(dateMeals.map((m) => [m.studentId, m.status]));
    const total = students.length;
    let meal = 0;
    let noMeal = 0;
    let absent = 0;

    for (const s of students) {
      const st = mealMap.get(s.uid);
      if (st === 'meal') meal++;
      else if (st === 'noMeal') noMeal++;
      else if (st === 'absent') absent++;
    }

    return { date, meal, noMeal, absent, pending: total - meal - noMeal - absent, total };
  });
}

function getDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function aggregateDaysByWeek(daily: DailyTotals[]): DailyTotals[] {
  const weekMap = new Map<string, DailyTotals>();
  for (const d of daily) {
    const dt = new Date(d.date);
    const weekStart = new Date(dt);
    weekStart.setDate(dt.getDate() - dt.getDay() + 1);
    const key = weekStart.toISOString().slice(0, 10);
    const existing = weekMap.get(key);
    if (existing) {
      existing.meal += d.meal;
      existing.noMeal += d.noMeal;
      existing.absent += d.absent;
      existing.pending += d.pending;
      existing.total += d.total;
    } else {
      weekMap.set(key, { ...d, date: key });
    }
  }
  return [...weekMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateDaysByMonth(daily: DailyTotals[]): DailyTotals[] {
  const monthMap = new Map<string, DailyTotals>();
  for (const d of daily) {
    const key = d.date.slice(0, 7);
    const existing = monthMap.get(key);
    if (existing) {
      existing.meal += d.meal;
      existing.noMeal += d.noMeal;
      existing.absent += d.absent;
      existing.pending += d.pending;
      existing.total += d.total;
    } else {
      monthMap.set(key, { ...d, date: key });
    }
  }
  return [...monthMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSchoolReport(filters: ReportFilters): Promise<SchoolReportData> {
  const { dateFrom, dateTo, schoolYearId } = filters;

  const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = dateTo || new Date().toISOString().slice(0, 10);

  const [users, classes, meals] = await Promise.all([
    fetchAllUsers(),
    fetchClasses(),
    fetchMealsForDateRange(from, to),
  ]);

  const activeClasses = classes.filter((c) => {
    if (c.archived) return false;
    if (schoolYearId && c.schoolYearId !== schoolYearId) return false;
    return true;
  });
  const activeClassIds = new Set(activeClasses.map((c) => c.id));

  const students = users.filter(
    (u) => u.role === 'student' && u.active && u.classId && activeClassIds.has(u.classId),
  );

  const dates = getDateRange(from, to);
  const daily = buildDailyTotals(dates, students, meals);
  const weekly = aggregateDaysByWeek(daily);
  const monthly = aggregateDaysByMonth(daily);

  const totalMeals = daily.reduce((sum, d) => sum + d.meal, 0);
  const totalStudentDays = daily.reduce((sum, d) => sum + d.total, 0);
  const avgMealPct = computePct(totalMeals, totalStudentDays);

  const absentByClass = new Map<string, number>();
  for (const m of meals) {
    if (m.status === 'absent') {
      absentByClass.set(m.classId, (absentByClass.get(m.classId) ?? 0) + 1);
    }
  }

  let mostAbsentClass = '—';
  let mostAbsentCount = 0;
  for (const [cid, count] of absentByClass) {
    if (count > mostAbsentCount) {
      mostAbsentCount = count;
      mostAbsentClass = activeClasses.find((c) => c.id === cid)?.name ?? cid;
    }
  }

  return { daily, weekly, monthly, avgMealPct, mostAbsentClass, mostAbsentCount };
}

export async function exportExcel(filters: ReportFilters, rows: DailyReportRow[]): Promise<void> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Звіт');

  sheet.columns = [
    { header: 'Учень', key: 'studentName', width: 30 },
    { header: 'Клас', key: 'className', width: 15 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Час', key: 'time', width: 20 },
    { header: 'Оновлено', key: 'updatedByName', width: 25 },
  ];

  const statusLabel: Record<string, string> = {
    meal: 'Харчується',
    noMeal: 'Не харчується',
    absent: 'Відсутній',
    pending: 'Не відмітився',
  };

  for (const row of rows) {
    const time =
      row.updatedAt instanceof Timestamp
        ? row.updatedAt.toDate().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
        : '—';
    sheet.addRow({
      studentName: row.studentName,
      className: row.className,
      status: statusLabel[row.status] ?? row.status,
      time,
      updatedByName: row.updatedByName,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `LunchPoint_Report_${filters.date}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportPdf(filters: ReportFilters, rows: DailyReportRow[]): Promise<void> {
  const pdfMakeModule = (await import('pdfmake/build/pdfmake')) as {
    default?: { createPdf: (def: unknown) => { download: (name: string) => void }; vfs?: unknown };
    createPdf?: (def: unknown) => { download: (name: string) => void };
    vfs?: unknown;
  };
  const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')) as {
    default?: { vfs?: unknown };
    vfs?: unknown;
  };
  const maker = pdfMakeModule.default ?? pdfMakeModule;
  (maker as { vfs?: unknown }).vfs =
    pdfFontsModule.default?.vfs ?? pdfFontsModule.vfs;

  const statusLabel: Record<string, string> = {
    meal: 'Харчується',
    noMeal: 'Не харчується',
    absent: 'Відсутній',
    pending: 'Не відмітився',
  };

  const tableBody: string[][] = [['Учень', 'Клас', 'Статус', 'Час', 'Оновлено']];
  for (const row of rows) {
    const time =
      row.updatedAt instanceof Timestamp
        ? row.updatedAt.toDate().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
        : '—';
    tableBody.push([
      row.studentName,
      row.className,
      statusLabel[row.status] ?? row.status,
      time,
      row.updatedByName,
    ]);
  }

  const docDefinition = {
    content: [
      { text: `LunchPoint — Звіт за ${filters.date}`, style: 'header' },
      {
        table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', '*'], body: tableBody },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 16] },
    },
  };

  (maker as { createPdf: (def: unknown) => { download: (name: string) => void } })
    .createPdf(docDefinition)
    .download(`LunchPoint_Report_${filters.date}.pdf`);
}
