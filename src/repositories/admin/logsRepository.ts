import { collection, getDocs, limit, query } from 'firebase/firestore'

import { db } from '../../firebase/client'
import type { LogEntry } from '../../types/admin'
import { toDateOrNull } from '../../utils/firestore'

export const listLogs = async (): Promise<LogEntry[]> => {
  const snapshot = await getDocs(query(collection(db, 'logs'), limit(300)))

  return snapshot.docs
    .map((item) => {
      const data = item.data()

      return {
        id: item.id,
        date: toDateOrNull(data.date ?? data.createdAt),
        user: typeof data.user === 'string' ? data.user : '',
        action: typeof data.action === 'string' ? data.action : '',
        target: typeof data.target === 'string' ? data.target : '',
        details: typeof data.details === 'string' ? data.details : '',
      }
    })
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
}
