import type { Profile } from '../../types'
import { X, Crown } from 'lucide-react'

interface Props {
  user: Profile
  onClose: () => void
}

export default function UserProfileModal({ user, onClose }: Props) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-up">
          <button onClick={onClose} className="float-right p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X className="w-5 h-5 dark:text-white" />
          </button>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-20 h-20 bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(user.full_name)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold dark:text-white flex items-center justify-center gap-1">
              {user.full_name}
              {user.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
            </h3>
            <p className="text-sm text-gray-500 mb-3">@{user.username}</p>
            {user.role === 'admin' && (
              <span className="inline-block text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2.5 py-0.5 rounded-full mb-3">
                Admin
              </span>
            )}
            {user.bio ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.bio}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin descripción</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
