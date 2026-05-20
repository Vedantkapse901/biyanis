-- Supabase Storage for direct browser uploads (EYE10-style, no custom upload API)
-- Run in Supabase SQL Editor after creating a public bucket named "media".

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media authenticated insert" on storage.objects;
create policy "media authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media authenticated update" on storage.objects;
create policy "media authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "media authenticated delete" on storage.objects;
create policy "media authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
