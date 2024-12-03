"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle routing in a separate effect
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login')
      } else if (user && pathname === '/login') {
        router.push('/')
      }
    }
  }, [user, loading, pathname, router])

  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
