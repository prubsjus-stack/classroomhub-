import { useEffect } from 'react'
import type { Activity } from '../../types'
import { ACTIVITY_TYPES } from '../../types'
import { X, FileText, ExternalLink, Star, Calendar, AlertTriangle } from 'lucide-react'

interface ActivityDetailModalProps {
  activity: Activity
  onClose: () => void
}

export default function ActivityDetailModal({ activity, onClose }: ActivityDetailModalProps) {
  const typeConfig = ACTIVITY_TYPES.find((t: { value: string }) => t.value === activity.type) || ACTIVITY_TYPES[0]
  const dueDate = activity.due_date ? new Date(activity.due_date) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pr-8">
          {activity.pinned && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Star className="w-3 h-3 fill-current" /> INFORMACIÓN
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          {activity.importance === 'alta' && (
            <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Importancia alta
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold dark:text-white mb-2">{activity.title}</h2>

        {dueDate && (
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="w-4 h-4" />
            {dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {activity.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Descripción</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{activity.description}</p>
          </div>
        )}

        {activity.file_url && (
          <a
            href={activity.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
          >
            {activity.file_name === '🔗 Enlace' ? (
              <><ExternalLink className="w-4 h-4" /> Abrir enlace</>
            ) : (
              <><FileText className="w-4 h-4" /> Ver {activity.file_name || 'archivo'}</>
            )}
          </a>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2.5 rounded-xl transition btn-press"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
