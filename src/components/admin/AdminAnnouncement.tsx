import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { SiteConfig } from '../../types'
import { Megaphone } from 'lucide-react'

export default function AdminAnnouncement() {
  const [version, setVersion] = useState('')
  const [info, setInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const { data, error } = await supabase.from('site_config').select('*').single()
    if (error) {
      await supabase.from('site_config').insert({ id: 1 }).maybeSingle()
      const { data: d2 } = await supabase.from('site_config').select('*').single()
      if (d2) {
        setVersion(d2.announcement_title || '')
        setInfo(d2.announcement_content || '')
      }
    } else if (data) {
      setVersion(data.announcement_title || '')
      setInfo(data.announcement_content || '')
    }
  }

  const publish = async () => {
    setSaving(true)
    setMsg(null)
    const { error } = await supabase.from('site_config').update({
      announcement_title: version.trim(),
      announcement_content: info.trim(),
    }).eq('id', 1)
    if (error) {
      setMsg({ ok: false, text: error.message })
    } else {
      setMsg({
        ok: true,
        text: version.trim() ? 'Publicado. Todos verán el mensaje al entrar.' : 'Aviso desactivado.',
      })
      setTimeout(() => setMsg(null), 3000)
    }
    setSaving(false)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Publica la versión y lo que trae la nueva actualización. A todos los usuarios les aparecerá al entrar.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <p className="font-medium dark:text-white">Nuevo aviso de actualización</p>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">VERSIÓN:</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Ej: v1.5"
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">INFORMACIÓN:</label>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder="Ej:&#10;• Nuevo chat entre estudiantes&#10;• Actividades de información fijadas con estrella&#10;• Pantalla de mantenimiento"
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white resize-none"
            rows={8}
          />
        </div>

        {msg && (
          <p className={`text-sm text-center ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>
        )}

        <button
          onClick={publish}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition btn-press disabled:opacity-50"
        >
          {saving ? 'Publicando...' : 'Publicar para todos los usuarios'}
        </button>
      </div>
    </div>
  )
}
