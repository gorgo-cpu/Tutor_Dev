import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Provides auth/session/profile state to the app
const SupabaseAuthContext = createContext(null)

async function fetchMyProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,display_name,role,requested_role,created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data || null
}

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const refreshProfile = async (explicitUserId) => {
    const userId = explicitUserId || user?.id
    if (!userId) {
      setProfile(null)
      setRole(null)
      return null
    }

    const p = await fetchMyProfile(userId)
    setProfile(p)
    setRole(p?.role || null)
    return p
  }

  const ensureProfile = async () => {
    const { error } = await supabase.rpc('ensure_profile')
    if (error) console.error('ensure_profile failed', error)
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setSession(data.session)
        setUser(data.session?.user || null)
        if (data.session?.user?.id) {
          await ensureProfile()
          await refreshProfile(data.session.user.id)
        } else {
          setProfile(null)
          setRole(null)
        }
      } catch (e) {
        console.error('Supabase session init failed', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setRole(null)
        return
      }
      if (nextSession?.user?.id) {
        try {
          await ensureProfile()
          await refreshProfile(nextSession.user.id)
        } catch (e) {
          console.error('Profile refresh failed', e)
        }
      }
    })

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  const signInWithPassword = async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error)
      return { data: null, error }
    }
    return { data, error: null }
  }

  const signUpWithPassword = async (email, password, requestedRole) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          requested_role: requestedRole,
        },
      },
    })
    if (error) {
      setAuthError(error)
      return { data: null, error, needsEmailConfirmation: false }
    }
    const needsEmailConfirmation = !data.session
    return { data, error: null, needsEmailConfirmation }
  }

  const signOut = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setAuthError(error)
    return { error: error || null }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role,
      loading,
      authError,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, role, loading, authError]
  )

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
}

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext)
}
