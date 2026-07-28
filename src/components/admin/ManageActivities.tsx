import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ActivityForm from './ActivityForm'
import type { Activity, Subject } from '../../types'
import { ACTIVITY_TYPES } from '../../types'
import { Plus, Edit3, Trash2 } from 'lucide-react'

export default function ManageActivities() {
  const [activities, setActivities] = useState<(Activity & { subjects?: Subject })[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filterSubject, setFilterSubject] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const channel = supabase.channel('admin-activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadData = async () => {
    const [actsRes, subsRes] = await Promise.all([
      supabase.from('activities').select('*, subjects(*)').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*').order('order_index'),
    ])
    if (actsRes.data) setActivities(actsRes.data as any)
    if (subsRes.data) setSubjects(subsRes.data as Subject[])
  }

  const deleteActivity = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return
    await supabase.from('activities').delete().eq('id', id)
    loadData()
  }

  const filtered = filterSubject === 'all'
    ? activities
    : activities.filter(a => a.subject_id === filterSubject)

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Sin materia'
  }

  const getTypeLabel = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-transparent dark:bg-gray-800 dark:text-white"
          >
            <option value="all" className="dark:bg-gray-800 dark:text-white">Todas las materias</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id} className="dark:bg-gray-800 dark:text-white">{s.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} actividad{filtered.length !== 1 ? 'es' : ''}</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((act) => (
          <div key={act.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {getTypeLabel(act.type)}
                  </span>
                  <span className="text-xs text-gray-500">{getSubjectName(act.subject_id)}</span>
                  {act.due_date && (
                    <span className="text-xs text-gray-400">
                      📅 {new Date(act.due_date).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
                <p className="font-medium dark:text-white">{act.title}</p>
                {act.description && (
                  <p className="text-sm text-gray-500 truncate mt-1">{act.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => setEditingActivity(act)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <Edit3 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => deleteActivity(act.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No hay actividades</div>
        )}
      </div>

      {showCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
            <div className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <ActivityForm onClose={() => { setShowCreate(false); loadData() }} />
            </div>
          </div>
        </>
      )}

      {editingActivity && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditingActivity(null)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
            <div className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <ActivityForm
                activity={editingActivity}
                onClose={() => { setEditingActivity(null); loadData() }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
