import { useState } from 'react'
import { HelpCircle, X, MessageCircle } from 'lucide-react'

export default function HelpHeader() {
  const [open, setOpen] = useState(false)
  const phoneNumber = '573228825610'
  const whatsappUrl = `https://wa.me/${phoneNumber}`

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
        <HelpCircle className="w-5 h-5 dark:text-white" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center pt-64 p-4" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❓</span>
                </div>
                <h2 className="text-xl font-bold dark:text-white mb-6">¿Necesitas ayuda?</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monitor</p>
                  <p className="font-semibold dark:text-white">JUSTIN DAVID MENDOZA ORTIZ</p>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition btn-press"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar mensaje por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
