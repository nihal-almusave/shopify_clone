-- Storage only lets users delete/replace objects they can also select through the API.
-- Merchants may list and manage files in their own folder (images stay public by URL).
create policy "Merchants read their files" on storage.objects
  for select to authenticated
  using (bucket_id = 'store-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
