DROP POLICY IF EXISTS "Public upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public select files" ON storage.objects;

CREATE POLICY "Public upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'Files');

CREATE POLICY "Public select files" ON storage.objects
FOR SELECT USING (bucket_id = 'Files');
