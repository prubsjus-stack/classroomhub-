import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Activity, Subject } from '../../types'
import { ACTIVITY_TYPES } from '../../types'
import { X, Upload, Send } from 'lucide-react'

interface ActivityFormProps {
  activity?: Activity | null
  onClose: () => void
}

export default function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    description: '',
    type: 'actividad',
    due_date: '',
    due_time: '23:59',
    importance: 'media',
  })
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('subjects').select('*').order('order_index').then(({ data }) => {
      if (data) {
        setSubjects(data as Subject[])
        if (!activity) {
          setForm(f => ({ ...f, subject_id: data[0]?.id || '' }))
        }
      }
    })

    if (activity) {
      setForm({
        subject_id: activity.subject_id,
        title: activity.title,
        description: activity.description || '',
        type: activity.type,
        due_date: activity.due_date ? activity.due_date.split('T')[0] : '',
        due_time: activity.due_date ? activity.due_date.split('T')[1]?.slice(0, 5) || '23:59' : '23:59',
        importance: activity.importance,
      })
      setFileUrl(activity.file_url)
      setFileName(activity.file_name)
    }
  }, [activity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let uploadedUrl = fileUrl
    let uploadedName = fileName

    if (file) {
      const ext = file.name.split('.').pop()
      const filePath = `activities/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('files').upload(filePath, file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath)
        uploadedUrl = urlData.publicUrl
        uploadedName = file.name
      }
    }

    const activityData = {
      subject_id: form.subject_id,
      title: form.title,
      description: form.description,
      type: form.type,
      due_date: form.due_date ? new Date(`${form.due_date}T${form.due_time}`).toISOString() : null,
      importance: form.importance,
      file_url: uploadedUrl,
      file_name: uploadedName,
    }

    if (activity) {
      await supabase.from('activities').update(activityData).eq('id', activity.id)
    } else {
      const { data: newActivity } = await supabase.from('activities').insert(activityData).select().single()

      if (newActivity) {
        const { data: students } = await supabase.from('profiles').select('id').neq('role', 'admin')
        if (students) {
          const notifications = students.map((s: { id: string }) => ({
            user_id: s.id,
            title: 'Nueva actividad',
            message: `${form.title} — ${subjects.find(sub => sub.id === form.subject_id)?.name || ''}`,
            type: 'activity',
          }))
          await supabase.from('notifications').insert(notifications)
        }
      }
    }

    setSubmitting(false)
    onClose()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold dark:text-white">
          {activity ? 'Editar actividad' : 'Crear nueva actividad'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
          <X className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:bg-gray-800 dark:text-white"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="dark:bg-gray-800 dark:text-white">{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Materia</label>
            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:bg-gray-800 dark:text-white"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-gray-800 dark:text-white">{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Fecha de entrega</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Hora</label>
            <input
              type="time"
              value={form.due_time}
              onChange={(e) => setForm({ ...form, due_time: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Importancia</label>
          <div className="flex gap-3">
            {[
              { value: 'baja', label: '🟢 Baja' },
              { value: 'media', label: '🟡 Media' },
              { value: 'alta', label: '🔴 Alta' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, importance: opt.value })}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition ${
                  form.importance === opt.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Archivo PDF (opcional)</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">
              {file ? file.name : fileName ? fileName : 'Haz clic para seleccionar un archivo PDF'}
            </p>
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition btn-press disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <><Send className="w-4 h-4" /> {activity ? 'Guardar cambios' : 'Publicar'}</>
          )}
        </button>
      </form>
    </div>
  )
}
