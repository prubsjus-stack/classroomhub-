-- Kick/expel users + persistent announcement toggle

-- Kicked users: session is closed and they disappear from lists until they log back in
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kicked BOOLEAN DEFAULT false;

-- Persistent announcement: while enabled, the modal keeps showing until the admin disables it
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false;

-- Ensure anon can read/write (matching existing setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
