import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Header from '../../components/layout/Header'
import AdminDashboard from '../../components/admin/AdminDashboard'
import ManageActivities from '../../components/admin/ManageActivities'
import ManageSubjects from '../../components/admin/ManageSubjects'
import ManageUsers from '../../components/admin/ManageUsers'
import ActivityForm from '../../components/admin/ActivityForm'
import { LayoutDashboard, FileText, BookOpen, Users, Plus, X } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/activities', label: 'Actividades', icon: FileText },
  { path: '/admin/subjects', label: 'Materias', icon: BookOpen },
  { path: '/admin/users', label: 'Usuarios', icon: Users },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showCreate, setShowCreate] = useState(false)

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Panel de Administración</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                isActive(item.path, item.exact)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="activities" element={<ManageActivities />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="users" element={<ManageUsers />} />
          </Routes>
        </div>
      </div>

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
      >
        {showCreate ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ActivityForm onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
