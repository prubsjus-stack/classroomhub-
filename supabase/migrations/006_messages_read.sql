ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
