# ClassroomHub 🎓

Plataforma web para gestionar materias y actividades académicas.
Construido con React + TypeScript + Supabase.

## Tecnologías

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Tiempo real:** Supabase Realtime (sin Socket.IO)

## Requisitos

- Node.js 20+ (para desarrollo local)
- Una cuenta gratuita en [Supabase](https://supabase.com)
- Una cuenta gratuita en [Vercel](https://vercel.com)

## Despliegue paso a paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto (nombre: `classroomhub`)
3. Guarda la **URL del proyecto** y la **Anon Key** (en Settings → API)

### 2. Configurar la base de datos

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script (crea tablas, políticas de seguridad y triggers)
4. Ve a **Authentication → Settings** y desactiva "Confirmar email" (para que los usuarios puedan registrarse sin verificar correo)

### 3. Configurar Storage (para avatares y archivos)

1. En Supabase, ve a **Storage**
2. Crea un bucket llamado `avatars` (público)
3. Crea un bucket llamado `files` (público)

### 4. Crear tu cuenta de administrador

1. Ve a **Authentication → Users** en Supabase
2. Haz clic en "Add User" (o registrate desde la app)
3. Usa el formato: email = `justin_admin@classroom.local`, contraseña = `200701`
4. Ve a **SQL Editor** y ejecuta:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE username = 'justin_admin';
   ```

### 5. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 6. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Conecta tu repositorio de GitHub (o sube los archivos manualmente)
3. En **Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Despliega

El sitio estará disponible en `https://classroomhub.vercel.app`

### 7. (Opcional) Dominio personalizado

En Vercel → Settings → Domains, puedes agregar un dominio personalizado (ej: `miclase.com`)

## Desarrollo local

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Vista previa de producción
```

## Estructura del proyecto

```
src/
├── components/
│   ├── activities/      # Tarjetas de actividad, animación de completado
│   ├── admin/           # Dashboard, CRUD actividades, materias, usuarios
│   ├── auth/            # (componentes de autenticación)
│   ├── help/            # Botón de ayuda con WhatsApp
│   ├── layout/          # Header, menú de usuario
│   ├── notifications/   # Campana de notificaciones
│   └── subjects/        # Tarjetas de materias
├── contexts/            # AuthContext, ThemeContext
├── lib/                 # Cliente de Supabase
├── pages/               # Páginas de la aplicación
│   └── admin/           # Panel de administración
└── types/               # Tipos de TypeScript
```

## Características

- ✅ Autenticación con usuario/contraseña
- ✅ "Recordarme" con sesión persistente
- ✅ Roles: admin y estudiante
- ✅ Panel de administración completo
- ✅ Tiempo real (nuevas actividades, cambios)
- ✅ Modo claro/oscuro
- ✅ Notificaciones automáticas
- ✅ Perfiles con foto y descripción
- ✅ Corona 👑 para administradores
- ✅ Agregar/remover administradores
- ✅ Barra de progreso por materia
- ✅ Alertas de tareas próximas a vencer
- ✅ Animación al completar actividad
- ✅ Botón de ayuda con WhatsApp
- ✅ Escalable (nuevas materias, funciones, usuarios)
- ✅ Los datos nunca se pierden al actualizar

## Licencia

MIT
