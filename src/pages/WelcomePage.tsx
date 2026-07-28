import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap } from 'lucide-react'

export default function WelcomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const t1 = setTimeout(() => setShowContent(true), 300)
    const t2 = setTimeout(() => setShowButton(true), 1500)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const handleStart = async () => {
    if (profile) {
      await supabase.from('profiles').update({ welcome_shown: true }).eq('id', profile.id)
      await refreshProfile()
    }
    navigate('/')
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`text-center transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
            Bienvenido
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-yellow-300 mb-6">
            Ingeniero 🎓
          </h2>

          <p className="text-xl text-white/80 max-w-lg mx-auto mb-10">
            Prepárate para organizar todas tus actividades y alcanzar tus objetivos.
          </p>

          <button
            onClick={handleStart}
            className={`px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-full shadow-2xl hover:scale-105 transition-all duration-500 btn-press ${showButton ? 'opacity-100' : 'opacity-0'}`}
          >
            Comenzar 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
