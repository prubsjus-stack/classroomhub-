import type { Subject } from '../../types'

const SUBJECT_ICONS_RECORD: Record<string, string> = {
  Calculator: '🔢',
  Radio: '📡',
  Leaf: '🌿',
  Laptop: '💻',
  BookOpen: '📖',
}

interface SubjectCardProps {
  subject: Subject
  pendingCount: number
  completedCount: number
  totalCount: number
  nextDate: string | null
  onClick: () => void
}

export default function SubjectCard({ subject, pendingCount, completedCount, totalCount, nextDate, onClick }: SubjectCardProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <button
      onClick={onClick}
      className="card-hover bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-left w-full"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ backgroundColor: `${subject.color}20` }}
      >
        {SUBJECT_ICONS_RECORD[subject.icon] || '📖'}
      </div>

      <h3 className="font-bold text-lg dark:text-white mb-1">{subject.name}</h3>
      {subject.professor && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{subject.professor}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          pendingCount > 0
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : 'Completado'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Progreso</span>
          <span className="font-medium dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: subject.color }}
          />
        </div>
      </div>

      {nextDate && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span>📅</span>
          <span>Próxima: {new Date(nextDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
        </div>
      )}
    </button>
  )
}
