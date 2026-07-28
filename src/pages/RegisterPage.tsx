import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { UserPlus, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async () => {
    setError('')
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const err = await signUp(username, fullName, password)
      if (err) {
        setError(err)
      } else {
        navigate('/welcome')
      }
    } catch (e: any) {
      setError(e?.message || 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ClassroomHub</h1>
          <p className="text-blue-200 mt-2">Crea tu cuenta y únete a tu clase</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:text-white"
                placeholder="Tu usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre con el que te verán los demás</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:text-white"
                placeholder="Ej: Justin Mendoza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:text-white"
                  placeholder="Tu contraseña"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:text-white"
                placeholder="Repite la contraseña"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition btn-press disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><UserPlus className="w-4 h-4" /> Crear Cuenta</>}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">¿Ya tienes cuenta?</p>
            <button type="button" onClick={() => { window.location.href = '/login' }} className="w-full mt-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition btn-press">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 text-white/40 text-xs font-medium">By:Justin</div>
    </div>
  )
}
