import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  session: any
  profile: Profile | null
  loading: boolean
  signIn: (username: string, password: string, remember: boolean) => Promise<string | null>
  signUp: (username: string, fullName: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (username: string, password: string, remember: boolean): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@classroom.local`,
      password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) return 'Credenciales inválidas'
      if (error.message.includes('Invalid login credentials')) return 'Usuario o contraseña incorrectos'
      return error.message
    }

    if (data.user) {
      await supabase.from('profiles').update({ last_sign_in: new Date().toISOString() }).eq('id', data.user.id)
    }

    if (remember) {
      await supabase.auth.setSession({
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
      })
    }

    return null
  }

  const signUp = async (username: string, fullName: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@classroom.local`,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (error) return error.message
    if (!data.user) return 'Error al crear cuenta'

    return null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isAdmin: profile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
