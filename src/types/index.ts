export interface Profile {
  id: string
  username: string
  full_name: string
  role: 'student' | 'admin'
  avatar_url: string | null
  bio: string
  welcome_shown: boolean
  theme: 'light' | 'dark' | 'system'
  created_at: string
  last_sign_in: string
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  professor: string
  order_index: number
  created_at: string
}

export interface Activity {
  id: string
  subject_id: string
  title: string
  description: string
  type: 'actividad' | 'taller' | 'quiz' | 'parcial' | 'laboratorio' | 'proyecto' | 'anuncio'
  due_date: string | null
  file_url: string | null
  file_name: string | null
  importance: 'baja' | 'media' | 'alta'
  created_at: string
  updated_at: string
}

export interface Completion {
  id: string
  user_id: string
  activity_id: string
  completed_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_eta: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string | null
  message: string
  read: boolean
  created_at: string
  sender?: Profile
}

export interface Feedback {
  id: string
  user_id: string
  type: 'error' | 'recomendacion' | 'comentario_positivo'
  message: string
  read: boolean
  created_at: string
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export const ACTIVITY_TYPES = [
  { value: 'actividad', label: 'Actividad', color: 'bg-blue-100 text-blue-700' },
  { value: 'taller', label: 'Taller', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'quiz', label: 'Quiz', color: 'bg-purple-100 text-purple-700' },
  { value: 'parcial', label: 'Parcial', color: 'bg-red-100 text-red-700' },
  { value: 'laboratorio', label: 'Laboratorio', color: 'bg-green-100 text-green-700' },
  { value: 'proyecto', label: 'Proyecto', color: 'bg-gray-100 text-gray-700' },
  { value: 'anuncio', label: 'Anuncio', color: 'bg-orange-100 text-orange-700' },
] as const

export const SUBJECT_ICONS: Record<string, string> = {
  Calculator: '🔢',
  Radio: '📡',
  Leaf: '🌿',
  Laptop: '💻',
  BookOpen: '📖',
}
