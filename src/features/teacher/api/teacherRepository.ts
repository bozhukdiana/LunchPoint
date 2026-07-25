import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { MealRecord, StoredMealStatus } from '@/features/student/types/student.types';
import type { AdminUser, SchoolClass } from '@/features/admin/types/admin.types';
import { getTodayDateString } from '@/features/student/utils/dateUtils';
import { firestore } from '@/firebase/firestore';

export async function getTeacherClass(classId: string): Promise<SchoolClass | null> {
  const snapshot = await getDoc(doc(firestore, 'classes', classId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<SchoolClass, 'id'>) };
}

export async function getClassStudents(classId: string): Promise<AdminUser[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, 'users'),
      where('role', '==', 'student'),
      where('classId', '==', classId),
      orderBy('displayName'),
    ),
  );
  return snapshot.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUser, 'uid'>) }));
}

export async function getTodayMealRecordsForClass(classId: string): Promise<MealRecord[]> {
  const today = getTodayDateString();
  const snapshot = await getDocs(
    query(collection(firestore, 'meals'), where('classId', '==', classId), where('date', '==', today)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MealRecord, 'id'>) }));
}

export async function getActiveSchoolYearId(): Promise<string> {
  const snapshot = await getDoc(doc(firestore, 'settings', 'schoolYearState'));
  return (snapshot.data()?.activeSchoolYearId as string | undefined) ?? '';
}

export async function updateMealStatus(
  studentId: string,
  classId: string,
  schoolYearId: string,
  status: StoredMealStatus,
  teacherId: string,
  before: StoredMealStatus | null,
): Promise<void> {
  const today = getTodayDateString();
  const docId = `${today}_${studentId}`;
  const mealRef = doc(firestore, 'meals', docId);
  const batch = writeBatch(firestore);

  if (before === null) {
    batch.set(mealRef, {
      studentId,
      classId,
      schoolYearId,
      date: today,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: teacherId,
    });
  } else {
    batch.update(mealRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: teacherId,
    });
  }

  batch.set(doc(collection(firestore, 'logs')), {
    actorId: teacherId,
    action: 'meal.status.updated',
    entityType: 'meal',
    entityId: docId,
    metadata: { before, after: status, studentId, classId },
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}
