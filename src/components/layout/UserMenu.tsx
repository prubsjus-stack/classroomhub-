import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Camera, Check, X, Sun, Moon, Monitor } from 'lucide-react'

export default function UserMenu() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bio, setBio] = useState(profile?.bio || '')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAvatarChange = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !profile) return
      const ext = file.name.split('.').pop()
      const filePath = `avatars/${profile.id}.${ext}`
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id)
      await refreshProfile()
    }
    input.click()
  }

  const saveBio = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ bio }).eq('id', profile.id)
    await refreshProfile()
    setEditingBio(false)
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium dark:text-white hidden sm:inline">{profile?.full_name}</span>
        {profile?.role === 'admin' && <span className="text-xs">👑</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold dark:text-white">{profile?.full_name}</p>
                  {profile?.role === 'admin' && <span className="text-sm">👑</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
              </div>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <button onClick={handleAvatarChange} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm dark:text-white">
              <Camera className="w-4 h-4 text-gray-500" /> Cambiar foto
            </button>

            {editingBio ? (
              <div className="px-3 py-2 space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  className="w-full text-sm p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  rows={2}
                  placeholder="Tu descripción..."
                />
                <div className="flex gap-2">
                  <button onClick={saveBio} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">
                    <Check className="w-3 h-3" /> Guardar
                  </button>
                  <button onClick={() => setEditingBio(false)} className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg">
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setBio(profile?.bio || ''); setEditingBio(true) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm dark:text-white">
                <span className="text-base">📝</span> {profile?.bio ? 'Editar descripción' : 'Añadir descripción'}
              </button>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 mb-2">Tema</p>
              <div className="flex gap-2">
                {[
                  { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Claro' },
                  { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Oscuro' },
                  { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Sistema' },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')}
                    className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition ${
                      theme === t.value ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm dark:text-white">
              ⚙️ Configuración
            </Link>

            <button onClick={() => { signOut(); navigate('/login') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm text-red-600">
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
