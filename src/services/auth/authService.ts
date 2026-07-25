import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '@/firebase/auth';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<void> {
  await setPersistence(firebaseAuth, browserLocalPersistence);
  await signInWithPopup(firebaseAuth, googleProvider);
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(firebaseAuth);
}
