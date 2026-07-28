import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import UserMenu from './UserMenu'
import NotificationBell from '../notifications/NotificationBell'
import ChatHeader from '../chat/ChatHeader'

export default function Header() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg dark:text-white hidden sm:inline">ClassroomHub</span>
          </button>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Panel Admin
              </button>
            )}
            <ChatHeader />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
