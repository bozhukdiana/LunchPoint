import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '../../firebase/client'
import type { SchoolYear } from '../../types/admin'
import { toDateOrNull } from '../../utils/firestore'

const schoolYearsCollection = collection(db, 'schoolYears')

export const listSchoolYears = async (): Promise<SchoolYear[]> => {
  const snapshot = await getDocs(query(schoolYearsCollection, orderBy('createdAt', 'desc')))

  return snapshot.docs.map((item) => {
    const data = item.data()

    return {
      id: item.id,
      title: typeof data.title === 'string' ? data.title : '',
      active: typeof data.active === 'boolean' ? data.active : false,
      archived: typeof data.archived === 'boolean' ? data.archived : false,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export const createSchoolYear = async (title: string) => {
  await addDoc(schoolYearsCollection, {
    title,
    active: false,
    archived: false,
    createdAt: serverTimestamp(),
  })
}

export const activateSchoolYear = async (schoolYearId: string) => {
  await runTransaction(db, async (transaction) => {
    const activeSnapshot = await getDocs(query(schoolYearsCollection, where('active', '==', true)))

    for (const item of activeSnapshot.docs) {
      if (item.id !== schoolYearId) {
        transaction.update(item.ref, { active: false })
      }
    }

    const targetRef = doc(db, 'schoolYears', schoolYearId)
    transaction.update(targetRef, { active: true, archived: false })
  })
}

export const archiveSchoolYear = async (schoolYearId: string) => {
  await updateDoc(doc(db, 'schoolYears', schoolYearId), { archived: true, active: false })
}

export const restoreSchoolYear = async (schoolYearId: string) => {
  await updateDoc(doc(db, 'schoolYears', schoolYearId), { archived: false })
}
