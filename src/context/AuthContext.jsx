import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [access, setAccess] = useState({ role: null, hospitalStatus: 'none', isAdmin: false, isHospitalVerified: false })
  const [loading, setLoading] = useState(true)

  async function applySession(nextSession) {
    setSession(nextSession)
    if (!nextSession?.user) {
      setProfile(null)
      setAccess({ role: null, hospitalStatus: 'none', isAdmin: false, isHospitalVerified: false })
      return
    }
    try {
      const nextProfile = await authService.getProfile(nextSession.user)
      const nextAccess = await authService.getAccessState(nextSession.user)
      setProfile(nextProfile)
      const effectiveRole = nextAccess.isAdmin
        ? 'admin'
        : nextAccess.isHospitalVerified
          ? 'hospital'
          : nextProfile?.role === 'donor'
            ? 'donor'
            : 'patient'
      setAccess({ ...nextAccess, role: effectiveRole })
    } catch {
      setProfile(null)
      setAccess({ role: null, hospitalStatus: 'none', isAdmin: false, isHospitalVerified: false })
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
          setAccess({ role: null, hospitalStatus: 'none', isAdmin: false, isHospitalVerified: false })
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
      role: access.role,
      isAdmin: access.isAdmin,
      hospitalStatus: access.hospitalStatus,
      isHospitalVerified: access.isHospitalVerified,
      loading,
      configured: isSupabaseConfigured,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
    }),
    [session, profile, access, loading],
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
