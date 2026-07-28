import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Subject } from '../../types'
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react'

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', color: '#3B82F6', icon: 'BookOpen', professor: '' })
  const [newSubject, setNewSubject] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('order_index')
    if (data) setSubjects(data as Subject[])
  }

  const addSubject = async () => {
    if (!editForm.name.trim()) return
    await supabase.from('subjects').insert({
      ...editForm,
      order_index: subjects.length,
    })
    setNewSubject(false)
    setEditForm({ name: '', color: '#3B82F6', icon: 'BookOpen', professor: '' })
    loadSubjects()
  }

  const updateSubject = async (id: string) => {
    await supabase.from('subjects').update(editForm).eq('id', id)
    setEditing(null)
    loadSubjects()
  }

  const deleteSubject = async (id: string) => {
    if (!confirm('¿Eliminar esta materia? Se eliminarán todas sus actividades.')) return
    await supabase.from('subjects').delete().eq('id', id)
    loadSubjects()
  }

  const startEdit = (subject: Subject) => {
    setEditing(subject.id)
    setEditForm({ name: subject.name, color: subject.color, icon: subject.icon, professor: subject.professor })
  }

  const ICONS = [
    { value: 'Calculator', label: '🔢' },
    { value: 'Radio', label: '📡' },
    { value: 'Leaf', label: '🌿' },
    { value: 'Laptop', label: '💻' },
    { value: 'BookOpen', label: '📖' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Administrar Materias</h2>
        <button
          onClick={() => { setNewSubject(true); setEditForm({ name: '', color: '#3B82F6', icon: 'BookOpen', professor: '' }) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Agregar materia
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            {editing === subject.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Profesor</label>
                    <input value={editForm.professor} onChange={(e) => setEditForm({ ...editForm, professor: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Color</label>
                    <input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Icono</label>
                    <div className="flex gap-1">
                      {ICONS.map((icon) => (
                        <button key={icon.value} onClick={() => setEditForm({ ...editForm, icon: icon.value })}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg border-2 transition ${
                            editForm.icon === icon.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}>{icon.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateSubject(subject.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"><Save className="w-3.5 h-3.5" /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 rounded-lg text-sm"><X className="w-3.5 h-3.5" /> Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ICONS.find(i => i.value === subject.icon)?.label || '📖'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium dark:text-white">{subject.name}</p>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  </div>
                  {subject.professor && <p className="text-xs text-gray-500">{subject.professor}</p>}
                </div>
                <button onClick={() => startEdit(subject)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><Edit3 className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => deleteSubject(subject.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            )}
          </div>
        ))}

        {subjects.length === 0 && !newSubject && (
          <div className="text-center py-12 text-gray-500">No hay materias. Crea la primera.</div>
        )}

        {newSubject && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-blue-200 dark:border-blue-700">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nombre de la materia" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Profesor</label>
                  <input value={editForm.professor} onChange={(e) => setEditForm({ ...editForm, professor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Opcional" />
                </div>
              </div>
              <div className="flex gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Icono</label>
                  <div className="flex gap-1">
                    {ICONS.map((icon) => (
                      <button key={icon.value} onClick={() => setEditForm({ ...editForm, icon: icon.value })}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg border-2 transition ${
                          editForm.icon === icon.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}>{icon.label}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addSubject} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"><Plus className="w-3.5 h-3.5" /> Crear</button>
                <button onClick={() => setNewSubject(false)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 rounded-lg text-sm"><X className="w-3.5 h-3.5" /> Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
