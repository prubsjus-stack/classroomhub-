import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WelcomePage from './pages/WelcomePage'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/admin/AdminPage'
import MaintenancePage from './pages/MaintenancePage'
import ChatButton from './components/chat/ChatButton'
import FeedbackButton from './components/feedback/FeedbackButton'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { ReactNode } from 'react'
import type { SiteConfig } from './types'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin, profile } = useAuth()
  const [maintenance, setMaintenance] = useState<SiteConfig | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('site_config').select('*').single().then(({ data }) => {
      if (data) setMaintenance(data as SiteConfig)
      setChecking(false)
    })
  }, [profile])

  if (loading || checking) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
  if (!session) return <Navigate to="/login" replace />
  if (maintenance?.maintenance_mode && !isAdmin) return <MaintenancePage />
  return <>{children}<ChatButton /><FeedbackButton /><div className="fixed bottom-3 right-4 text-gray-400 dark:text-gray-600 text-xs font-medium pointer-events-none select-none z-50">By:Justin</div></>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

function WelcomeGuard() {
  const { profile } = useAuth()
  if (profile && !profile.welcome_shown) {
    return <Navigate to="/welcome" replace />
  }
  return <HomePage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><WelcomeGuard /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminRoute><AdminPage /></AdminRoute></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
