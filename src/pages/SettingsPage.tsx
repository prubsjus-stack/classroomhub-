import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import Header from '../components/layout/Header'
import { Sun, Moon, Monitor, Camera, Lock, Save } from 'lucide-react'

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    setMessage('')
    await supabase.from('profiles').update({ full_name: fullName, bio }).eq('id', profile.id)
    await refreshProfile()
    setMessage('Perfil actualizado')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const changePassword = async () => {
    if (newPassword !== confirmNewPassword) { setMessage('Las contraseñas no coinciden'); return }
    if (newPassword.length < 6) { setMessage('La contraseña debe tener al menos 6 caracteres'); return }

    setSaving(true)
    setMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) { setMessage(error.message) } else {
      setMessage('Contraseña actualizada')
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => setMessage(''), 3000)
    }
  }

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

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        <h1 className="text-2xl font-bold dark:text-white mb-6">⚙️ Configuración</h1>

        {message && (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm p-3 rounded-lg mb-4 animate-fade-in">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold dark:text-white mb-4">Tema</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', icon: <Sun className="w-5 h-5" />, label: 'Claro' },
                { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Oscuro' },
                { value: 'system', icon: <Monitor className="w-5 h-5" />, label: 'Sistema' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {t.icon}
                  <span className="text-sm font-medium dark:text-white">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold dark:text-white mb-4">Perfil</h2>
            <div className="flex items-center gap-4 mb-4">
              <button onClick={handleAvatarChange} className="relative group">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <div>
                <p className="font-medium dark:text-white">{profile?.full_name}</p>
                <p className="text-sm text-gray-500">@{profile?.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={2}
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/150 caracteres</p>
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition btn-press disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Guardar cambios
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold dark:text-white mb-4">Seguridad</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Repite la contraseña"
                />
              </div>
              <button
                onClick={changePassword}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition btn-press disabled:opacity-50"
              >
                <Lock className="w-4 h-4" /> Actualizar contraseña
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
