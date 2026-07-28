import { useEffect, useState } from 'react'

interface CompletionAnimationProps {
  show: boolean
  title?: string
  onClose: () => void
}

export default function CompletionAnimation({ show, onClose }: CompletionAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [show, onClose])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setVisible(false); setTimeout(onClose, 300) }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-slide-up">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline className="animate-check" points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-1">Actividad completada</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">¡Sigue así! 🎉</p>
      </div>
    </div>
  )
}
