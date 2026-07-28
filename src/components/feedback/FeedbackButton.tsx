import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { MessageSquare, X, Send, Bug, Lightbulb, ThumbsUp } from 'lucide-react'

const FEEDBACK_TYPES = [
  { value: 'error', label: 'Error', icon: Bug, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  { value: 'recomendacion', label: 'Recomendación', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'comentario_positivo', label: 'Comentario positivo', icon: ThumbsUp, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
]

export default function FeedbackButton() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !type || !message.trim()) return
    setSubmitting(true)
    await supabase.from('feedback').insert({
      user_id: profile.id,
      type,
      message: message.trim(),
    })
    setSubmitting(false)
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setType(''); setMessage('') }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
        title="Feedback / Recomendaciones"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold dark:text-white">Enviar recomendación</h3>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-medium dark:text-white">¡Gracias por tu feedback!</p>
                  <p className="text-sm text-gray-500">Tu mensaje ha sido enviado.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-2">Tipo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FEEDBACK_TYPES.map(ft => (
                        <button
                          key={ft.value}
                          type="button"
                          onClick={() => setType(ft.value)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs transition ${
                            type === ft.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <ft.icon className={`w-5 h-5 ${ft.color.split(' ')[0]}`} />
                          <span className="font-medium dark:text-white">{ft.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Mensaje</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe tu mensaje aquí..."
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <p className="text-xs text-gray-400">
                    Soy Justin, realmente hice esta aplicación en una noche, puede presentar errores o si quieres mejorar el funcionamiento, envíame una recomendación.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting || !type || !message.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition btn-press disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <><Send className="w-4 h-4" /> Enviar</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
