import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Feedback } from '../../types'
import { Bug, Lightbulb, ThumbsUp, Check, Trash2 } from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  error: { label: 'Error', icon: Bug, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  recomendacion: { label: 'Recomendación', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  comentario_positivo: { label: 'Comentario positivo', icon: ThumbsUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<(Feedback & { user?: { full_name: string; username: string } })[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, user:profiles!user_id(full_name, username)')
      .order('created_at', { ascending: false })
    if (data) setFeedback(data as any)
  }

  const markRead = async (id: string) => {
    await supabase.from('feedback').update({ read: true }).eq('id', id)
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, read: true } : f))
  }

  const deleteFeedback = async (id: string) => {
    await supabase.from('feedback').delete().eq('id', id)
    setFeedback(prev => prev.filter(f => f.id !== id))
  }

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.type === filter)

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[{ value: 'all', label: 'Todos' }, ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              filter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay feedback</div>
        ) : (
          filtered.map(f => {
            const cfg = TYPE_CONFIG[f.type]
            const Icon = cfg?.icon
            return (
              <div
                key={f.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 transition ${
                  !f.read ? 'border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900' : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {Icon && <div className={`p-2 rounded-xl ${cfg.color}`}><Icon className="w-4 h-4" /></div>}
                    <div>
                      <span className="text-sm font-medium dark:text-white">
                        {(f as any).user?.full_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">@{(f as any).user?.username || '?'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!f.read && (
                      <button onClick={() => markRead(f.id)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition" title="Marcar leído">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteFeedback(f.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap">{f.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(f.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
