-- Pinned (info) activities + announcement columns for site_config

-- Starred/info activities (always on top, not counted, not completable)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Announcement (version + changelog) shown on login
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS announcement_title TEXT DEFAULT '';
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS announcement_content TEXT DEFAULT '';

-- Ensure the single config row exists
INSERT INTO public.site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is disabled and anon has access (matching existing setup)
ALTER TABLE public.site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
