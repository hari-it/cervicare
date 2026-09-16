import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function applySession(nextSession) {
    setSession(nextSession)
    if (!nextSession?.user) {
      setProfile(null)
      return
    }
    try {
      setProfile(await authService.getProfile(nextSession.user))
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    let active = true
    authService
      .getSession()
      .then((next) => (active ? applySession(next) : null))
      .catch(() => {
        if (active) {
          setSession(null)
          setProfile(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data } = authService.onAuthStateChange((next) => {
      if (active) applySession(next)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      configured: isSupabaseConfigured,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
