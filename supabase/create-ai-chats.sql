-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates the ai_chats table for storing AI assistant conversation history

create table if not exists ai_chats (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New AI chat',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ai_chats enable row level security;

create policy "Users see own chats" on ai_chats
  for all using (user_id = auth.uid());

create index if not exists idx_ai_chats_user on ai_chats(user_id);
create index if not exists idx_ai_chats_company on ai_chats(company_id);

-- Updated_at trigger
create trigger ai_chats_updated_at before update on ai_chats
  for each row execute function update_updated_at();
