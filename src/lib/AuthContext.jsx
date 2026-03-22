// ============================================================
// AUTH CONTEXT
// Provides user state across the app.
// Supports: Google, Apple, Anonymous sign-in via Supabase.
// Graceful fallback when Supabase is not configured.
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Supabase user object
  const [profile, setProfile] = useState(null)  // profiles table row
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch profile from profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.log('[Auth] Profile fetch error:', error.message)
      return null
    }
    return data
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        const p = await fetchProfile(u.id)
        setProfile(p)
      }
      setLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user || null
        setUser(u)
        if (u) {
          const p = await fetchProfile(u.id)
          setProfile(p)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [fetchProfile])

  // ---- SIGN IN WITH GOOGLE ----
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      setError('Supabase non configuré')
      return { error: 'Supabase non configuré' }
    }
    setError(null)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error.message)
    return { data, error }
  }, [])

  // ---- SIGN IN WITH APPLE ----
  const signInWithApple = useCallback(async () => {
    if (!supabase) {
      setError('Supabase non configuré')
      return { error: 'Supabase non configuré' }
    }
    setError(null)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(error.message)
    return { data, error }
  }, [])

  // ---- SIGN IN ANONYMOUSLY ----
  const signInAnonymously = useCallback(async () => {
    if (!supabase) {
      setError('Supabase non configuré')
      return { error: 'Supabase non configuré' }
    }
    setError(null)
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) setError(error.message)
    return { data, error }
  }, [])

  // ---- CONVERT ANONYMOUS TO PERMANENT ----
  // Links an anonymous account to Google/Apple so scores persist
  const linkToGoogle = useCallback(async () => {
    if (!supabase) return
    return supabase.auth.linkIdentity({ provider: 'google' })
  }, [])

  const linkToApple = useCallback(async () => {
    if (!supabase) return
    return supabase.auth.linkIdentity({ provider: 'apple' })
  }, [])

  // ---- SIGN OUT ----
  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  // ---- UPDATE PROFILE ----
  const updateProfile = useCallback(async (updates) => {
    if (!supabase || !user) return
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { data, error }
  }, [user])

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isAnonymous: user?.is_anonymous || false,
    isConfigured: !!supabase,
    signInWithGoogle,
    signInWithApple,
    signInAnonymously,
    linkToGoogle,
    linkToApple,
    signOut,
    updateProfile,
    fetchProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
