import { doc, getDoc, setDoc } from 'firebase/firestore'

import { db } from '../../firebase/client'
import type { GeneralSettings } from '../../types/admin'

const settingsDocRef = doc(db, 'settings', 'general')

const defaultSettings: GeneralSettings = {
  schoolName: '',
  applicationName: 'LunchPoint',
  mealStartTime: '12:00',
  mealEndTime: '14:00',
}

export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  const snapshot = await getDoc(settingsDocRef)

  if (!snapshot.exists()) {
    return defaultSettings
  }

  const data = snapshot.data()

  return {
    schoolName: typeof data.schoolName === 'string' ? data.schoolName : defaultSettings.schoolName,
    applicationName: typeof data.applicationName === 'string' ? data.applicationName : defaultSettings.applicationName,
    mealStartTime: typeof data.mealStartTime === 'string' ? data.mealStartTime : defaultSettings.mealStartTime,
    mealEndTime: typeof data.mealEndTime === 'string' ? data.mealEndTime : defaultSettings.mealEndTime,
  }
}

export const updateGeneralSettings = async (payload: GeneralSettings) => {
  await setDoc(settingsDocRef, payload, { merge: true })
}
