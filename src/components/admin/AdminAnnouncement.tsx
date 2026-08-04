import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Megaphone, Power } from 'lucide-react'

export default function AdminAnnouncement() {
  const [version, setVersion] = useState('')
  const [info, setInfo] = useState('')
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
        setVersion(d2.announcement_title || '')
        setInfo(d2.announcement_content || '')
        setEnabled(!!d2.announcement_enabled)
      }
    } else if (data) {
      setVersion(data.announcement_title || '')
      setInfo(data.announcement_content || '')
      setEnabled(!!data.announcement_enabled)
    }
  }

  const publish = async (activate: boolean) => {
    setSaving(true)
    setMsg(null)
    const { error } = await supabase.from('site_config').update({
      announcement_title: version.trim(),
      announcement_content: info.trim(),
      announcement_enabled: activate,
    }).eq('id', 1)
    if (error) {
      setMsg({ ok: false, text: error.message })
    } else {
      setEnabled(activate)
      setMsg({
        ok: true,
        text: activate ? 'Anuncio activado. Se mostrará a todos hasta que lo desactives.' : 'Anuncio desactivado. Ya no se mostrará a nadie.',
      })
      setTimeout(() => setMsg(null), 3000)
    }
    setSaving(false)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Mientras el anuncio esté <strong>ACTIVO</strong> se seguirá mostrando a todos los usuarios al entrar. Se detiene cuando lo desactives.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <p className="font-medium dark:text-white">Aviso de actualización</p>
          </div>
          <button
            onClick={() => publish(!enabled)}
            disabled={saving}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition btn-press disabled:opacity-50 ${
              enabled
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {enabled ? 'ACTIVO' : 'INACTIVO'}
          </button>
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
          onClick={() => publish(true)}
          disabled={saving || !version.trim() || !info.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition btn-press disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Activar y mostrar a todos'}
        </button>

        {enabled && (
          <button
            onClick={() => publish(false)}
            disabled={saving}
            className="w-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl transition btn-press disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Desactivar anuncio
          </button>
        )}
      </div>
    </div>
  )
}
