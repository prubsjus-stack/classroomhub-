import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    return saved || 'system'
  })

  const getEffectiveTheme = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return t
  }

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    () => getEffectiveTheme(theme)
  )

  useEffect(() => {
    const effective = getEffectiveTheme(theme)
    setEffectiveTheme(effective)
    document.documentElement.classList.toggle('dark', effective === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (profile?.theme) {
      setThemeState(profile.theme)
    }
  }, [profile?.theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const effective = getEffectiveTheme('system')
      setEffectiveTheme(effective)
      document.documentElement.classList.toggle('dark', effective === 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const saveThemeToProfile = async (t: Theme) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ theme: t }).eq('id', user.id)
    }
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    saveThemeToProfile(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
