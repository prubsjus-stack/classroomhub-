import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { SiteConfig } from '../../types'
import { Construction, Clock } from 'lucide-react'

export default function AdminMaintenance() {
  const [config, setConfig] = useState<SiteConfig>({ maintenance_mode: false, maintenance_message: '', maintenance_eta: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const { data } = await supabase.from('site_config').select('*').single()
    if (data) setConfig(data as SiteConfig)
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('site_config').update(config).eq('id', 1)
    setSaving(false)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Activa el modo mantenimiento para mostrar una pantalla a los estudiantes mientras haces cambios.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Construction className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium dark:text-white">Modo mantenimiento</p>
              <p className="text-xs text-gray-500">Los estudiantes verán la pantalla de mantenimiento</p>
            </div>
          </div>
          <button
            onClick={() => setConfig({ ...config, maintenance_mode: !config.maintenance_mode })}
            className={`relative w-12 h-6 rounded-full transition ${config.maintenance_mode ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${config.maintenance_mode ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {config.maintenance_mode && (
          <>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Mensaje</label>
              <textarea
                value={config.maintenance_message}
                onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
                placeholder="Estamos realizando mejoras..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Tiempo estimado
              </label>
              <input
                type="text"
                value={config.maintenance_eta}
                onChange={(e) => setConfig({ ...config, maintenance_eta: e.target.value })}
                placeholder="Ej: 2 horas, 15:00 hrs, etc."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
              />
            </div>
          </>
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
