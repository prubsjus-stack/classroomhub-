import { useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

interface AnnouncementModalProps {
  title: string
  content: string
  onClose: () => void
}

export default function AnnouncementModal({ title, content, onClose }: AnnouncementModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const lines = content.split('\n').filter(l => l.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold dark:text-white">{title}</h2>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
          {lines.length > 0 ? (
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">•</span>
                  <span className="whitespace-pre-wrap">{line.replace(/^[-•*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">{content}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition btn-press"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
