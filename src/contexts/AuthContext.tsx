import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Auth } from 'firebase/auth'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

interface AuthContextType {
  currentUser: User | null
  auth: Auth
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const createOrUpdateUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        totalTests: 0,
        totalTime: 0,
        bestWPM: 0,
        averageWPM: 0,
        accuracy: 0,
        streak: 0
      })
    } else {
      // Update last login
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp()
      })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await createOrUpdateUserProfile(user)
      }
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await createOrUpdateUserProfile(userCredential.user)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    currentUser,
    auth,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
