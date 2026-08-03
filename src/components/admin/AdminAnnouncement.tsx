import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { SiteConfig } from '../../types'
import { Megaphone } from 'lucide-react'

export default function AdminAnnouncement() {
  const [config, setConfig] = useState<SiteConfig>({
    maintenance_mode: false,
    maintenance_message: '',
    maintenance_eta: '',
    announcement_title: '',
    announcement_content: '',
  })
  const [enabled, setEnabled] = useState(false)
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
        setConfig(d2 as SiteConfig)
        setEnabled(!!d2.announcement_title)
      }
    } else if (data) {
      setConfig(data as SiteConfig)
      setEnabled(!!data.announcement_title)
    }
  }

  const save = async () => {
    setSaving(true)
    setMsg(null)
    const payload = {
      ...config,
      announcement_title: enabled ? config.announcement_title : '',
      announcement_content: enabled ? config.announcement_content : '',
    }
    const { error } = await supabase.from('site_config').update(payload).eq('id', 1)
    if (error) {
      setMsg({ ok: false, text: error.message })
    } else {
      setMsg({ ok: true, text: 'Cambios guardados' })
      setTimeout(() => setMsg(null), 2000)
    }
    setSaving(false)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Publica un aviso con la versión de la actualización y lo que trae. Les aparecerá a todos los estudiantes al entrar.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium dark:text-white">Aviso de actualización</p>
              <p className="text-xs text-gray-500">Se muestra al entrar al sitio</p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-6 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${enabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {enabled && (
          <>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Título (ej: versión)</label>
              <input
                type="text"
                value={config.announcement_title}
                onChange={(e) => setConfig({ ...config, announcement_title: e.target.value })}
                placeholder="Nueva versión 1.5 🎉"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">¿Qué trae esta actualización?</label>
              <textarea
                value={config.announcement_content}
                onChange={(e) => setConfig({ ...config, announcement_content: e.target.value })}
                placeholder="• Nuevo chat entre estudiantes&#10;• Actividades de información fijadas..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white resize-none"
                rows={6}
              />
            </div>
          </>
        )}

        {msg && (
          <p className={`text-sm text-center ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition btn-press disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
