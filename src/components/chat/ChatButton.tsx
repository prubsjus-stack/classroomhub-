import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Profile, Message } from '../../types'
import { MessageCircle, X, Send, ArrowLeft } from 'lucide-react'

export default function ChatButton() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [chatUser, setChatUser] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) { setChatUser(null); setMessages([]); return }
    supabase.from('profiles').select('*').neq('id', profile?.id).then(({ data }) => {
      if (data) setUsers(data as Profile[])
    })
  }, [open, profile?.id])

  useEffect(() => {
    if (!chatUser || !profile) return
    loadMessages()

    const channel = supabase.channel(`chat-${profile.id}-${chatUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=in.(${profile.id},${chatUser.id}),receiver_id=in.(${profile.id},${chatUser.id})`,
      }, (payload: any) => {
        setMessages(prev => [...prev, payload.new as Message])
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
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-20 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up flex flex-col" style={{ height: '420px' }}>
          {!chatUser ? (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold dark:text-white">Chat</h3>
                <p className="text-xs text-gray-500">Selecciona un usuario</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setChatUser(u)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.full_name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">{u.full_name}</p>
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
                  <ArrowLeft className="w-4 h-4 dark:text-white" />
                </button>
                {chatUser.avatar_url ? (
                  <img src={chatUser.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(chatUser.full_name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium dark:text-white">{chatUser.full_name}</p>
                  <p className="text-xs text-gray-500">@{chatUser.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      m.sender_id === profile?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent dark:text-white text-sm outline-none"
                />
                <button onClick={sendMessage} disabled={!newMsg.trim()} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
