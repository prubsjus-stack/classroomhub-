import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/layout/Header'
import ActivityCard from '../components/activities/ActivityCard'
import CompletionAnimation from '../components/activities/CompletionAnimation'
import type { Subject, Activity, Completion } from '../types'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function SubjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [completions, setCompletions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [completionAnim, setCompletionAnim] = useState<{ show: boolean; title: string }>({ show: false, title: '' })

  useEffect(() => {
    if (!id) return
    loadData()

    const channel = supabase.channel(`subject-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `subject_id=eq.${id}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${profile?.id}` }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, profile])

  const loadData = async () => {
    if (!id || !profile) return

    const [subjectRes, activitiesRes, completionsRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('id', id).single(),
      supabase.from('activities').select('*').eq('subject_id', id).order('created_at', { ascending: false }),
      supabase.from('completions').select('*').eq('user_id', profile.id),
    ])

    if (subjectRes.data) setSubject(subjectRes.data as Subject)
    if (activitiesRes.data) setActivities(activitiesRes.data as Activity[])
    if (completionsRes.data) {
      setCompletions(new Set(completionsRes.data.map((c: Completion) => c.activity_id)))
    }
    setLoading(false)
  }

  const handleComplete = async (activityId: string, activityTitle: string) => {
    if (!profile || completions.has(activityId)) return
    await supabase.from('completions').insert({
      user_id: profile.id,
      activity_id: activityId,
    })
    setCompletions(prev => new Set([...prev, activityId]))
    setCompletionAnim({ show: true, title: activityTitle })
  }

  const handleUncomplete = async (activityId: string) => {
    if (!profile) return
    await supabase.from('completions').delete().match({
      user_id: profile.id,
      activity_id: activityId,
    })
    setCompletions(prev => {
      const next = new Set(prev)
      next.delete(activityId)
      return next
    })
  }

  const totalCount = activities.length
  const completedCount = activities.filter(a => completions.has(a.id)).length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const sortedActivities = [...activities].sort((a, b) => {
    const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity
    const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity
    return aDue - bDue
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Materia no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a materias
        </button>

        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{subject.name}</h1>
              {subject.professor && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subject.professor}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} actividad{totalCount !== 1 ? 'es' : ''}
              </span>
              <span className="text-sm font-medium dark:text-white">{progress}% completado</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: subject.color }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sortedActivities.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay actividades en esta materia aún.</p>
              </div>
            ) : (
              sortedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  completed={completions.has(activity.id)}
                  onComplete={() => handleComplete(activity.id, activity.title)}
                  onCancel={() => handleUncomplete(activity.id)}
                  showAnimation={completionAnim.show && completionAnim.title === activity.title}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <CompletionAnimation
        show={completionAnim.show}
        title={completionAnim.title}
        onClose={() => setCompletionAnim({ show: false, title: '' })}
      />
    </div>
  )
}
