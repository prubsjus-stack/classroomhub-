# ClassroomHub - Resumen del proyecto

## Stack
- React + Vite + TypeScript + Tailwind CSS v4
- Supabase (Auth, Database, Storage, Realtime)
- Hosting: Vercel (`https://classroomhub-eta.vercel.app`)
- GitHub: `prubsjus-stack/classroomhub-`
- Supabase: `https://mupjyynyldfzkukznumz.supabase.co`
- Admin: `justin_admin` / `200701`

## Features implementadas
- Login/Register (synthetic email username@classroom.local)
- Roles: student + admin (admin tiene 👑)
- Materias, Actividades (con archivos PDF, enlaces, fechas, importancia)
- Marcar actividades como realizadas + cancelar
- Notificaciones en tiempo real (campanita 🔔) con clic para navegar
- Notificaciones al crear y editar actividades
- Borrar notificaciones individuales
- Chat entre estudiantes en el header con punto rojo para mensajes nuevos
- Feedback (errores/recomendaciones/comentarios) desde botón flotante
- Admin: CRUD de actividades, materias, usuarios, cambiar contraseñas
- Admin: modo mantenimiento (estudiantes ven pantalla con reloj)
- Admin: ver feedback recibido
- Temas claro/oscuro/sistema
- Perfiles con avatar, bio
- Pantalla de bienvenida con partículas (primer login)
- "By:Justin" en esquina inferior derecha

## SQL pendiente por ejecutar
```sql
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

ALTER TABLE public.site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
```

## Archivos clave
- `src/App.tsx` - Routas, ProtectedRoute con check de mantenimiento
- `src/lib/supabase.ts` - Cliente Supabase
- `src/contexts/AuthContext.tsx` - Auth
- `src/contexts/ThemeContext.tsx` - Tema
- `src/pages/admin/AdminPage.tsx` - Panel admin con tabs
- `src/components/admin/` - Componentes admin
- `src/components/notifications/NotificationBell.tsx` - Campanita
- `src/components/chat/ChatHeader.tsx` - Chat en header
- `src/components/help/HelpHeader.tsx` - Ayuda en header
- `src/components/feedback/FeedbackButton.tsx` - Feedback flotante
- `src/types/index.ts` - Tipos TypeScript
- `supabase/schema.sql` - Schema DB
- `supabase/migrations/` - Migraciones SQL

## Para retomar
Si pierdes la conversación, pega este mensaje en una nueva:
"Tengo un proyecto ClassroomHub en GitHub (prubsjus-stack/classroomhub-) desplegado en Vercel (classroomhub-eta.vercel.app) con Supabase. Necesito continuar el desarrollo. Léeme el archivo PROYECTO.md de la raíz del proyecto para entender el estado actual."