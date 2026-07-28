-- Add link_url column to activities table
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
