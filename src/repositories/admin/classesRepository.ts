import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'

import { db } from '../../firebase/client'
import type { ClassFilterOption, SchoolClass } from '../../types/admin'
import { toDateOrNull } from '../../utils/firestore'
import { listSchoolYears } from './schoolYearsRepository'

const classesCollection = (schoolYearId: string) => collection(db, 'schoolYears', schoolYearId, 'classes')

export const listClasses = async (schoolYearId: string): Promise<SchoolClass[]> => {
  const snapshot = await getDocs(query(classesCollection(schoolYearId), orderBy('createdAt', 'desc')))

  return snapshot.docs.map((item) => {
    const data = item.data()

    return {
      id: item.id,
      name: typeof data.name === 'string' ? data.name : '',
      classTeacherId: typeof data.classTeacherId === 'string' && data.classTeacherId.length > 0 ? data.classTeacherId : null,
      archived: typeof data.archived === 'boolean' ? data.archived : false,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

interface UpsertClassPayload {
  name: string
  classTeacherId: string | null
}

export const createClass = async (schoolYearId: string, payload: UpsertClassPayload) => {
  await addDoc(classesCollection(schoolYearId), {
    ...payload,
    archived: false,
    createdAt: serverTimestamp(),
  })
}

export const updateClass = async (schoolYearId: string, classId: string, payload: UpsertClassPayload) => {
  await updateDoc(doc(db, 'schoolYears', schoolYearId, 'classes', classId), payload)
}

export const setClassArchivedState = async (schoolYearId: string, classId: string, archived: boolean) => {
  await updateDoc(doc(db, 'schoolYears', schoolYearId, 'classes', classId), { archived })
}

export const listClassFilterOptions = async (): Promise<ClassFilterOption[]> => {
  const schoolYears = await listSchoolYears()
  const options: ClassFilterOption[] = []

  for (const schoolYear of schoolYears) {
    if (schoolYear.archived) {
      continue
    }

    const classes = await listClasses(schoolYear.id)

    for (const classItem of classes) {
      if (!classItem.archived) {
        options.push({
          id: classItem.id,
          title: `${classItem.name} (${schoolYear.title})`,
        })
      }
    }
  }

  return options
}
