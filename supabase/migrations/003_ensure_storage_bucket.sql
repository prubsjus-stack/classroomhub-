-- Function to ensure the files storage bucket exists
CREATE OR REPLACE FUNCTION public.ensure_storage_bucket()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'storage'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM buckets WHERE name = 'files') THEN
    INSERT INTO buckets (id, name, public)
    VALUES ('files', 'files', true);
  END IF;
  RETURN TRUE;
END;
$$;
