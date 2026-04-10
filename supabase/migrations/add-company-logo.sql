-- Add logo_url column to companies table
-- Run this in the Supabase SQL Editor

alter table companies add column if not exists logo_url text;

-- ─── Storage bucket for company logos ───
-- Public read, authenticated write. Files are stored under `{company_id}/logo.{ext}`.
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- Allow public read of all logos
drop policy if exists "Public can read company logos" on storage.objects;
create policy "Public can read company logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');

-- Allow authenticated users to upload/update logos for their own company.
-- The first path segment must equal their company_id.
drop policy if exists "Users can upload their company logo" on storage.objects;
create policy "Users can upload their company logo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = (
      select company_id::text from users where id = auth.uid()
    )
  );

drop policy if exists "Users can update their company logo" on storage.objects;
create policy "Users can update their company logo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = (
      select company_id::text from users where id = auth.uid()
    )
  );

drop policy if exists "Users can delete their company logo" on storage.objects;
create policy "Users can delete their company logo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = (
      select company_id::text from users where id = auth.uid()
    )
  );
