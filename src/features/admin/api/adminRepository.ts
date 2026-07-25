import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import type {
  AdminDashboardData,
  AdminUser,
  AuditLog,
  SchoolClass,
  SchoolSettings,
  SchoolYear,
} from '@/features/admin/types/admin.types';
import type {
  ClassFormValues,
  SchoolYearFormValues,
  SettingsFormValues,
  UserFormValues,
} from '@/features/admin/schemas/adminSchemas';
import { firestore } from '@/firebase/firestore';

const collections = {
  users: collection(firestore, 'users'),
  classes: collection(firestore, 'classes'),
  schoolYears: collection(firestore, 'schoolYears'),
  logs: collection(firestore, 'logs'),
};

function logReference() {
  return doc(collections.logs);
}

function addLog(
  batch: ReturnType<typeof writeBatch>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  batch.set(logReference(), {
    actorId,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: serverTimestamp(),
  });
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const snapshot = await getDocs(query(collections.users, orderBy('displayName')));
  return snapshot.docs.map((item) => ({ uid: item.id, ...(item.data() as Omit<AdminUser, 'uid'>) }));
}

export async function getClasses(): Promise<SchoolClass[]> {
  const snapshot = await getDocs(query(collections.classes, orderBy('name')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<SchoolClass, 'id'>) }));
}

export async function getSchoolYears(): Promise<SchoolYear[]> {
  const snapshot = await getDocs(query(collections.schoolYears, orderBy('startDate', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<SchoolYear, 'id'>) }));
}

export async function getSettings(): Promise<SchoolSettings | null> {
  const snapshot = await getDoc(doc(firestore, 'settings', 'school'));
  return snapshot.exists() ? (snapshot.data() as SchoolSettings) : null;
}

export async function getLogs(): Promise<AuditLog[]> {
  const snapshot = await getDocs(query(collections.logs, orderBy('createdAt', 'desc'), limit(100)));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<AuditLog, 'id'>) }));
}

export async function getDashboardData(): Promise<AdminDashboardData> {
  const [users, classes, schoolYears] = await Promise.all([getAdminUsers(), getClasses(), getSchoolYears()]);
  return { users, classes, schoolYears };
}

export async function createUser(values: UserFormValues, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.set(doc(firestore, 'users', values.uid), {
    displayName: values.displayName,
    email: values.email || null,
    role: values.role,
    classId: values.classId || null,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'user.created', 'user', values.uid, { role: values.role });
  await batch.commit();
}

export async function updateUser(uid: string, values: Omit<UserFormValues, 'uid'>, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'users', uid), {
    displayName: values.displayName,
    email: values.email || null,
    role: values.role,
    classId: values.classId || null,
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'user.updated', 'user', uid, { role: values.role });
  await batch.commit();
}

export async function setUserActive(uid: string, active: boolean, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'users', uid), { active, updatedAt: serverTimestamp() });
  addLog(batch, actorId, active ? 'user.activated' : 'user.deactivated', 'user', uid);
  await batch.commit();
}

export async function createClass(values: ClassFormValues, actorId: string): Promise<void> {
  const classReference = doc(collections.classes);
  const batch = writeBatch(firestore);
  batch.set(classReference, {
    name: values.name,
    teacherId: values.teacherId || null,
    schoolYearId: values.schoolYearId || null,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'class.created', 'class', classReference.id);
  await batch.commit();
}

export async function updateClass(id: string, values: ClassFormValues, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'classes', id), {
    name: values.name,
    teacherId: values.teacherId || null,
    schoolYearId: values.schoolYearId || null,
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'class.updated', 'class', id);
  await batch.commit();
}

export async function archiveClass(id: string, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'classes', id), { archived: true, updatedAt: serverTimestamp() });
  addLog(batch, actorId, 'class.archived', 'class', id);
  await batch.commit();
}

export async function createSchoolYear(values: SchoolYearFormValues, actorId: string): Promise<void> {
  const yearReference = doc(collections.schoolYears);
  const batch = writeBatch(firestore);
  batch.set(yearReference, {
    ...values,
    active: false,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'schoolYear.created', 'schoolYear', yearReference.id);
  await batch.commit();
}

export async function activateSchoolYear(id: string, actorId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const stateReference = doc(firestore, 'settings', 'schoolYearState');
    const stateSnapshot = await transaction.get(stateReference);
    const activeSchoolYearId = stateSnapshot.data()?.activeSchoolYearId as string | undefined;

    if (activeSchoolYearId && activeSchoolYearId !== id) {
      transaction.update(doc(firestore, 'schoolYears', activeSchoolYearId), {
        active: false,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(doc(firestore, 'schoolYears', id), {
      active: true,
      archived: false,
      updatedAt: serverTimestamp(),
    });
    transaction.set(
      stateReference,
      { activeSchoolYearId: id, updatedAt: serverTimestamp() },
      { merge: true },
    );
    transaction.set(logReference(), {
      actorId,
      action: 'schoolYear.activated',
      entityType: 'schoolYear',
      entityId: id,
      metadata: {},
      createdAt: serverTimestamp(),
    });
  });
}

export async function archiveSchoolYear(id: string, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'schoolYears', id), {
    active: false,
    archived: true,
    updatedAt: serverTimestamp(),
  });
  addLog(batch, actorId, 'schoolYear.archived', 'schoolYear', id);
  await batch.commit();
}

export async function saveSettings(values: SettingsFormValues, actorId: string): Promise<void> {
  const batch = writeBatch(firestore);
  batch.set(
    doc(firestore, 'settings', 'school'),
    { ...values, logoUrl: values.logoUrl || null, updatedAt: serverTimestamp() },
    { merge: true },
  );
  addLog(batch, actorId, 'settings.updated', 'settings', 'school');
  await batch.commit();
}
