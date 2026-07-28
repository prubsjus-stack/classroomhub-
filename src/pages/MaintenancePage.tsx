import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteConfig } from '../types'
import { Construction, Clock } from 'lucide-react'

export default function MaintenancePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as SiteConfig)
    })

    const channel = supabase.channel('site_config')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_config' }, (p: any) => {
        setConfig(p.new as SiteConfig)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
          <Construction className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold dark:text-white mb-3">Sitio en mantenimiento</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {config?.maintenance_message || 'Estamos realizando mejoras en el sitio. Vuelve pronto.'}
        </p>
        {config?.maintenance_eta && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-4 py-3 mx-auto w-fit">
            <Clock className="w-4 h-4" />
            Tiempo estimado: {config.maintenance_eta}
          </div>
        )}
        <div className="mt-8 text-xs text-gray-400">By:Justin</div>
      </div>
    </div>
  )
}
