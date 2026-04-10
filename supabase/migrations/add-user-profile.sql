-- Add user profile fields + avatar storage bucket.
-- Run this in the Supabase SQL Editor.
--
-- Adds:
-- - users.avatar_url (public URL to their avatar)
-- - users.job_title  (their role AT the company, e.g. "Founder", "VP Eng")
--   Distinct from users.role which is the platform role (admin / member).
-- - user-avatars storage bucket, public read, path-scoped write by auth.uid.
--
-- Idempotent: safe to re-run.

alter table users add column if not exists avatar_url text;
alter table users add column if not exists job_title text;

-- ─── Storage bucket for user avatars ───
-- Public read, authenticated write. Files are stored under `{user_id}/avatar-{ts}.{ext}`.
insert into storage.buckets (id, name, public)
values ('user-avatars', 'user-avatars', true)
on conflict (id) do nothing;

-- Allow public read of all avatars
drop policy if exists "Public can read user avatars" on storage.objects;
create policy "Public can read user avatars"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

-- Allow authenticated users to upload/update/delete their OWN avatar.
-- The first path segment must equal their auth.uid().
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
