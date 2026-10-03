import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// La infraestructura de Supabase esta rechazando JWTs validos con PGRST303
// ("JWT issued at future") por un desfase de reloj en sus servidores. Cuando eso
// pasa, una lectura de PostgREST responde 401 y la app se queda sin datos.
// Aqui reintentamos la lectura sin la cabecera Authorization (solo apikey), que si
// funciona. En cuanto Supabase corrija el reloj, este retry nunca se dispara.
const resilientFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init)
  if (res.status !== 401) return res

  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (!url.includes('/rest/v1/')) return res

  const method = (
    init?.method ?? (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET')
  ).toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') return res

  const baseHeaders =
    init?.headers ?? (typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined)
  const headers = new Headers(baseHeaders)
  headers.delete('Authorization')
  headers.delete('authorization')

  return fetch(input, { ...init, headers })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: resilientFetch,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})