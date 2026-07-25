import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { useQuery } from '@tanstack/react-query'

import { AuthContext, type AuthContextValue } from '../context/AuthContext'
import { auth } from '../firebase/client'
import { getUserProfile } from '../repositories/usersRepository'
import type { SessionStatus } from '../types/auth'

const googleProvider = new GoogleAuthProvider()

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
    })

    return unsubscribe
  }, [])

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useQuery({
    queryKey: ['user-profile', firebaseUser?.uid],
    queryFn: () => getUserProfile(firebaseUser!.uid),
    enabled: Boolean(firebaseUser?.uid),
  })

  const status: SessionStatus = useMemo(() => {
    if (firebaseUser === undefined || (firebaseUser && (isProfileLoading || isProfileFetching))) {
      return 'loading'
    }

    if (!firebaseUser) {
      return 'unauthenticated'
    }

    if (!profile) {
      return 'missing-profile'
    }

    if (!profile.active) {
      return 'inactive'
    }

    return 'authenticated'
  }, [firebaseUser, isProfileFetching, isProfileLoading, profile])

  const value: AuthContextValue = useMemo(
    () => ({
      firebaseUser: firebaseUser ?? null,
      profile: profile ?? null,
      status,
      isLoading: status === 'loading',
      signInWithGoogle: async () => {
        await signInWithPopup(auth, googleProvider)
      },
      signOutUser: async () => {
        await signOut(auth)
      },
    }),
    [firebaseUser, profile, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
