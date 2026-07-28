import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import UserMenu from './UserMenu'
import NotificationBell from '../notifications/NotificationBell'

export default function Header() {
  const { isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg dark:text-white hidden sm:inline">ClassroomHub</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Panel Admin
              </Link>
            )}
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
