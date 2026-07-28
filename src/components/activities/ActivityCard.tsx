import type { Activity } from '../../types'
import { ACTIVITY_TYPES } from '../../types'
import { Check, FileText, AlertTriangle } from 'lucide-react'

interface ActivityCardProps {
  activity: Activity
  completed: boolean
  onComplete: () => void
  onCancel?: () => void
  showAnimation?: boolean
}

export default function ActivityCard({ activity, completed, onComplete, onCancel }: ActivityCardProps) {
  const typeConfig = ACTIVITY_TYPES.find((t: { value: string }) => t.value === activity.type) || ACTIVITY_TYPES[0]
  const dueDate = activity.due_date ? new Date(activity.due_date) : null
  const now = new Date()
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null

  const isOverdue = dueDate && dueDate < now && !completed
  const isUrgent = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && !completed

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 ${
      completed
        ? 'opacity-75 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
        : isOverdue
          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
          : isUrgent
            ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {isUrgent && !completed && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
          ⚠ TAREA PRÓXIMA A ENTREGA
        </div>
      )}
      {isOverdue && !completed && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
          🔴 ACTIVIDAD VENCIDA
        </div>
      )}

      <div className="p-5 pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            {activity.importance === 'alta' && !completed && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          {completed && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        <h4 className={`font-semibold text-base mb-1 dark:text-white ${completed ? 'line-through text-gray-500' : ''}`}>
          {activity.title}
        </h4>
        {activity.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{activity.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue && !completed ? 'text-red-600 font-medium' : ''}`}>
              📅 {dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              {isOverdue && !completed && ' — ATRASADO'}
              {daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && !completed && !isOverdue && (
                <span className="text-yellow-600 font-medium"> — Faltan {daysUntilDue} día{daysUntilDue > 1 ? 's' : ''}</span>
              )}
            </span>
          )}
          {activity.file_url && (
            <a
              href={activity.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="w-3.5 h-3.5" />
              {activity.file_name || 'Archivo'}
            </a>
          )}
        </div>

        {!completed && (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition btn-press"
          >
            <Check className="w-4 h-4" />
            Marcar como realizada
          </button>
        )}

        {completed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-xl">
              <Check className="w-4 h-4" />
              Completado
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition btn-press"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
