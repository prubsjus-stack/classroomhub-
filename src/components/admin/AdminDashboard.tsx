import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Activity } from '../../types'
import { Users, FileText, BookOpen, TrendingUp } from 'lucide-react'

interface Stats {
  totalStudents: number
  totalActivities: number
  totalSubjects: number
  totalCompletions: number
  recentActivities: Activity[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalActivities: 0,
    totalSubjects: 0,
    totalCompletions: 0,
    recentActivities: [],
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [profiles, activitiesRes, subjects, completions, recentRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*'),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('completions').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*, subjects(name)').order('created_at', { ascending: false }).limit(5),
    ])

    const allActivities = (activitiesRes.data || []) as Activity[]
    const realActivities = allActivities.filter((a) => !a.pinned && a.type !== 'informacion')

    setStats({
      totalStudents: profiles.count || 0,
      totalActivities: realActivities.length,
      totalSubjects: subjects.count || 0,
      totalCompletions: completions.count || 0,
      recentActivities: (recentRes.data || []) as any,
    })
  }

  const cards = [
    { label: 'Total Estudiantes', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: 'Actividades', value: stats.totalActivities, icon: FileText, color: 'bg-purple-500' },
    { label: 'Materias', value: stats.totalSubjects, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Completadas', value: stats.totalCompletions, icon: TrendingUp, color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold dark:text-white mb-4">Últimas actividades creadas</h2>
        {stats.recentActivities.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay actividades aún</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivities.map((act: any) => (
              <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{act.title}</p>
                  <p className="text-xs text-gray-500">{act.subjects?.name || 'Sin materia'}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(act.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
