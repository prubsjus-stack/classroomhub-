import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, Trash2 } from 'lucide-react'
import type { Notification } from '../../types'

export default function NotificationBell() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!profile) return
    loadNotifications()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload: any) => {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  const loadNotifications = async () => {
    if (!profile) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data as Notification[])
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = async () => {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).is('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = (n: Notification) => {
    markAsRead(n.id)
    if (n.type.startsWith('activity:')) {
      const subjectId = n.type.split(':')[1]
      if (subjectId) navigate(`/subject/${subjectId}`)
    }
  }

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    if (type.startsWith('activity')) return '📝'
    switch (type) {
      case 'announcement': return '📢'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Bell className="w-5 h-5 dark:text-white" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute -right-4 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold dark:text-white">Notificaciones</h3>
            {unread > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer ${
                    !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleClick(n)}
                >
                  <span className="text-lg">{getIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
