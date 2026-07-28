import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types'
import { Search, Crown, KeyRound } from 'lucide-react'

export default function ManageUsers() {
  const [users, setUsers] = useState<(Profile & { adminCount?: number })[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, admins: 0, today: 0 })
  const [resetTarget, setResetTarget] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) {
      const profiles = data as Profile[]
      const today = new Date().toDateString()
      setUsers(profiles)
      setStats({
        total: profiles.length,
        admins: profiles.filter(p => p.role === 'admin').length,
        today: profiles.filter(p => new Date(p.last_sign_in).toDateString() === today).length,
      })
    }
  }

  const toggleAdmin = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin'
    if (newRole === 'admin') {
      if (!confirm(`¿Convertir a "${user.full_name}" en administrador?`)) return
    } else {
      if (!confirm(`¿Quitar permisos de administrador a "${user.full_name}"?`)) return
    }
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    loadUsers()
  }

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword.trim()) return
    setResetting(true)
    setResetMsg(null)

    const { error } = await supabase.rpc('admin_reset_password', {
      target_user_id: resetTarget.id,
      new_password: newPassword.trim(),
    })

    if (error) {
      setResetMsg({ ok: false, text: error.message })
    } else {
      setResetMsg({ ok: true, text: 'Contraseña actualizada correctamente' })
      setTimeout(() => { setResetTarget(null); setNewPassword(''); setResetMsg(null) }, 1500)
    }
    setResetting(false)
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Total estudiantes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold dark:text-white">{stats.admins}</p>
          <p className="text-sm text-gray-500">Administradores</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold dark:text-white">{stats.today}</p>
          <p className="text-sm text-gray-500">Activos hoy</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuario..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Nombre</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Registro</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Última conexión</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Rol</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="p-4 text-sm dark:text-white">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium dark:text-white">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 hidden sm:table-cell">@{user.username}</td>
                  <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4 text-sm hidden md:table-cell">
                    <span className={new Date(user.last_sign_in).toDateString() === new Date().toDateString() ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {new Date(user.last_sign_in).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Crown className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 px-2 py-1">Estudiante</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' ? (
                        <button onClick={() => toggleAdmin(user)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                          👑 Quitar admin
                        </button>
                      ) : (
                        <button onClick={() => toggleAdmin(user)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                          <Crown className="w-3 h-3" /> Hacer Admin
                        </button>
                      )}
                      <button onClick={() => { setResetTarget(user); setNewPassword(''); setResetMsg(null) }} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition whitespace-nowrap">
                        <KeyRound className="w-3 h-3" /> Cambiar contraseña
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No se encontraron usuarios</div>
        )}
      </div>

      {resetTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => { setResetTarget(null); setResetMsg(null) }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-sm w-full">
              <h3 className="text-lg font-bold dark:text-white mb-2">
                Cambiar contraseña
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Nueva contraseña para <strong className="dark:text-white">{resetTarget.full_name}</strong>
              </p>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Escribe la nueva contraseña"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white mb-4"
                autoFocus
              />
              {resetMsg && (
                <p className={`text-sm mb-3 ${resetMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {resetMsg.text}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setResetTarget(null); setResetMsg(null) }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resetting || !newPassword.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition btn-press disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Guardar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
