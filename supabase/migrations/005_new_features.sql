-- Site config (maintenance mode)
CREATE TABLE IF NOT EXISTS public.site_config (
  id INT PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT '',
  maintenance_eta TEXT DEFAULT '',
  CHECK (id = 1)
);
INSERT INTO public.site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('error', 'recomendacion', 'comentario_positivo')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
