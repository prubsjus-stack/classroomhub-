import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Profile, Message } from '../../types'
import { MessageCircle, Send, ArrowLeft, Crown } from 'lucide-react'

export default function ChatHeader() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [chatUser, setChatUser] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profile) return
    loadUnread()

    const ch = supabase.channel('chat-unread')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, () => {
        setUnread(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [profile])

  const loadUnread = async () => {
    if (!profile) return
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', profile.id).is('read', false)
    if (count !== null) setUnread(count)
  }

  const markAsRead = async () => {
    if (!profile || !chatUser) return
    await supabase.from('messages').update({ read: true }).eq('receiver_id', profile.id).eq('sender_id', chatUser.id).is('read', false)
    setUnread(prev => Math.max(0, prev - messages.filter(m => m.sender_id === chatUser.id && !m.read !== false).length))
  }

  useEffect(() => {
    if (!open) { setChatUser(null); setMessages([]); return }
    supabase.from('profiles').select('*').neq('id', profile?.id).order('role', { ascending: false }).then(({ data }) => {
      if (data) setUsers(data as Profile[])
    })
  }, [open, profile?.id])

  useEffect(() => {
    if (!chatUser || !profile) return
    loadMessages()

    const channel = supabase.channel(`chat-h-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, (payload: any) => {
        const m = payload.new as Message
        if (m.sender_id === chatUser.id || m.receiver_id === chatUser.id) {
          setMessages(prev => [...prev, m])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatUser?.id, profile?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    if (!chatUser || !profile) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as Message[])
  }

  const sendMessage = async () => {
    if (!profile || !chatUser || !newMsg.trim()) return
    await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: chatUser.id,
      message: newMsg.trim(),
    })
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      sender_id: profile.id,
      receiver_id: chatUser.id,
      message: newMsg.trim(),
      read: true,
      created_at: new Date().toISOString(),
    }])
    setNewMsg('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
        <MessageCircle className="w-5 h-5 dark:text-white" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute -right-4 top-full mt-2 w-72 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50 flex flex-col" style={{ height: '460px' }}>
          {!chatUser ? (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold dark:text-white">Chat</h3>
                <p className="text-xs text-gray-500">Selecciona un usuario</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {users.map(u => (
                  <button key={u.id} onClick={() => { setChatUser(u); setTimeout(markAsRead, 100) }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.full_name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium dark:text-white truncate flex items-center gap-1">
                        {u.full_name}
                        {u.role === 'admin' && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                      </p>
                      <p className="text-xs text-gray-500">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
                <button onClick={() => setChatUser(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <ArrowLeft className="w-5 h-5 dark:text-white" />
                </button>
                {chatUser.avatar_url ? (
                  <img src={chatUser.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(chatUser.full_name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                    {chatUser.full_name}
                    {chatUser.role === 'admin' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                  </p>
                  <p className="text-xs text-gray-500">@{chatUser.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No hay mensajes aún</div>}
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      m.sender_id === profile?.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
                <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent dark:text-white text-sm outline-none"
                />
                <button onClick={sendMessage} disabled={!newMsg.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
