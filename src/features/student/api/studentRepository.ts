import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { MealRecord } from '@/features/student/types/student.types';
import { firestore } from '@/firebase/firestore';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMealDocId(studentUid: string): string {
  return `${getTodayDateString()}_${studentUid}`;
}

export async function getTodayMeal(studentUid: string): Promise<MealRecord | null> {
  const docId = getMealDocId(studentUid);
  const snapshot = await getDoc(doc(firestore, 'meals', docId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...(snapshot.data() as Omit<MealRecord, 'id'>) };
}

export async function markMeal(studentUid: string, classId: string): Promise<void> {
  const today = getTodayDateString();
  const docId = getMealDocId(studentUid);
  const mealRef = doc(firestore, 'meals', docId);
  const schoolYearStateRef = doc(firestore, 'settings', 'schoolYearState');

  await runTransaction(firestore, async (transaction) => {
    const [mealSnap, stateSnap] = await Promise.all([transaction.get(mealRef), transaction.get(schoolYearStateRef)]);

    if (mealSnap.exists()) {
      throw new Error('Запис на сьогодні вже існує.');
    }

    const schoolYearId = (stateSnap.data()?.activeSchoolYearId as string | undefined) ?? '';

    const now = serverTimestamp();
    transaction.set(mealRef, {
      studentId: studentUid,
      classId,
      schoolYearId,
      date: today,
      status: 'meal',
      createdAt: now,
      updatedAt: now,
      updatedBy: studentUid,
    });
  });
}
