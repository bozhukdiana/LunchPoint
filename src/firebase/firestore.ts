import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/config';

export const firestore = getFirestore(firebaseApp);
