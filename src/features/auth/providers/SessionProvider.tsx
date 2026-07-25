import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthContext } from '@/features/auth/context/AuthContext';
import type { AuthSession } from '@/features/auth/types/auth.types';
import { firebaseAuth } from '@/firebase/auth';
import { getUserProfile } from '@/services/repositories/usersRepository';
import { signInWithGoogle, signOutCurrentUser } from '@/services/auth/authService';

const initialSession: AuthSession = {
  firebaseUser: null,
  profile: null,
  status: 'loading',
  error: null,
};

const verificationError = 'Не вдалося перевірити доступ до системи. Спробуйте ще раз.';

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession>(initialSession);

  const resolveProfile = useCallback(async () => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      setSession({ firebaseUser: null, profile: null, status: 'unauthenticated', error: null });
      return;
    }

    setSession((current) => ({ ...current, firebaseUser: currentUser, status: 'loading', error: null }));

    try {
      const profile = await getUserProfile(currentUser.uid);

      if (firebaseAuth.currentUser?.uid !== currentUser.uid) {
        return;
      }

      setSession({
        firebaseUser: currentUser,
        profile,
        status: profile && profile.active !== false ? 'authenticated' : 'unauthorized',
        error: profile?.active === false ? 'Ваш обліковий запис деактивовано адміністратором.' : null,
      });
    } catch {
      if (firebaseAuth.currentUser?.uid !== currentUser.uid) {
        return;
      }

      setSession({ firebaseUser: currentUser, profile: null, status: 'error', error: verificationError });
    }
  }, []);

  useEffect(() => onAuthStateChanged(firebaseAuth, () => void resolveProfile()), [resolveProfile]);

  const value = useMemo(
    () => ({
      ...session,
      signIn: signInWithGoogle,
      signOut: signOutCurrentUser,
      refreshSession: resolveProfile,
    }),
    [resolveProfile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
