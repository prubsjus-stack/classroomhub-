import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/layout/Header'
import SubjectCard from '../components/subjects/SubjectCard'
import type { Subject, Activity, Completion } from '../types'
import { GraduationCap } from 'lucide-react'

interface SubjectWithStats extends Subject {
  pendingCount: number
  completedCount: number
  totalCount: number
  nextDate: string | null
}

export default function HomePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const channel = supabase.channel('home-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${profile?.id}` }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  const loadData = async () => {
    if (!profile) return
    const [subjectsData, activitiesData, completionsData] = await Promise.all([
      supabase.from('subjects').select('*').order('order_index'),
      supabase.from('activities').select('*'),
      supabase.from('completions').select('*').eq('user_id', profile.id),
    ])
    if (!subjectsData.data) return

    const acts = (activitiesData.data || []) as Activity[]
    const comps = (completionsData.data || []) as Completion[]
    const completedIds = new Set(comps.map(c => c.activity_id))
    const isInfo = (a: Activity) => a.pinned || a.type === 'informacion'

    const subjectsWithStats: SubjectWithStats[] = subjectsData.data.map((s: Subject) => {
      const subjectActs = acts.filter(a => a.subject_id === s.id && !isInfo(a))
      const totalCount = subjectActs.length
      const completedCount = subjectActs.filter(a => completedIds.has(a.id)).length
      const pendingCount = totalCount - completedCount
      const now = new Date()
      const upcomingDates = subjectActs
        .filter(a => a.due_date && !completedIds.has(a.id) && new Date(a.due_date) > now)
        .map(a => a.due_date!)
        .sort()
      const nextDate = upcomingDates[0] || null

      return { ...s, pendingCount, completedCount, totalCount, nextDate }
    })

    setSubjects(subjectsWithStats)
    setLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold dark:text-white">
              {getGreeting()}, {profile?.full_name?.split(' ')[0]}!
            </h1>
            {profile?.role === 'admin' && <span className="text-xl">👑</span>}
          </div>
          <p className="text-gray-500 dark:text-gray-400">Tus materias</p>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold dark:text-white mb-2">No hay materias aún</h2>
            <p className="text-gray-500 dark:text-gray-400">El administrador agregará las materias próximamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                pendingCount={subject.pendingCount}
                completedCount={subject.completedCount}
                totalCount={subject.totalCount}
                nextDate={subject.nextDate}
                onClick={() => navigate(`/subject/${subject.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      
    </div>
  )
}
