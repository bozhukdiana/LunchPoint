import { doc, getDoc } from 'firebase/firestore';
import { userProfileSchema } from '@/features/auth/api/userProfileSchema';
import type { UserProfile } from '@/features/auth/types/auth.types';
import { firestore } from '@/firebase/firestore';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userSnapshot = await getDoc(doc(firestore, 'users', uid));

  if (!userSnapshot.exists()) {
    return null;
  }

  return {
    uid,
    ...userProfileSchema.parse(userSnapshot.data()),
  };
}
