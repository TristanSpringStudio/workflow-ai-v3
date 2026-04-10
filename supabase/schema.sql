-- Vishtan Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- ─── Companies ───
create table companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  industry text,
  size text, -- e.g. "1-10", "11-50", "51-200"
  logo_url text, -- public Supabase Storage URL for company logo
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Users (admins who sign up via Supabase Auth) ───
create table users (
  id uuid references auth.users(id) on delete cascade primary key,
  company_id uuid references companies(id) on delete cascade not null,
  email text not null,
  full_name text,
  role text default 'admin', -- admin | member
  created_at timestamptz default now()
);

-- ─── Contributors (employees who get interviewed — no auth account) ───
create table contributors (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text,
  role text, -- job title
  department text,
  ai_comfort text check (ai_comfort in ('none', 'beginner', 'intermediate', 'advanced')),
  interviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ─── Interview Tokens (magic links for contributors) ───
create table interview_tokens (
  id uuid default gen_random_uuid() primary key,
  token text unique not null,
  company_id uuid references companies(id) on delete cascade not null,
  contributor_id uuid references contributors(id) on delete set null,
  status text default 'invited' check (status in ('invited', 'in_progress', 'completed')),
  invited_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  invited_by uuid references users(id)
);

-- ─── Interviews (the actual conversation data) ───
create table interviews (
  id uuid default gen_random_uuid() primary key,
  token_id uuid references interview_tokens(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  contributor_id uuid references contributors(id) on delete set null,
  transcript jsonb default '[]'::jsonb, -- array of {role, content}
  extracted_data jsonb, -- the ExtractedSoFar at completion
  duration text,
  workflows_extracted int default 0,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ─── Workflows (canonical, post-dedup) ───
create table workflows (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  short_id text not null, -- t1, t2, etc. for display
  title text not null,
  description text,
  department text,
  frequency text,
  time_spent text,
  tools text[] default '{}',
  inputs jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  outputs jsonb default '[]'::jsonb,
  pain_points text[] default '{}',
  is_bottleneck boolean default false,
  tags text[] default '{}',
  knowledge jsonb default '[]'::jsonb, -- KnowledgeCitation[]
  added_by uuid references contributors(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, short_id)
);

-- ─── Workflow Contributors (many-to-many) ───
create table workflow_contributors (
  workflow_id uuid references workflows(id) on delete cascade,
  contributor_id uuid references contributors(id) on delete cascade,
  primary key (workflow_id, contributor_id)
);

-- ─── Recommendations (per-workflow AI analysis) ───
create table recommendations (
  id uuid default gen_random_uuid() primary key,
  workflow_id uuid references workflows(id) on delete cascade not null unique,
  company_id uuid references companies(id) on delete cascade not null,
  summary text,
  impact jsonb, -- {timeSaved, costSaved, qualityGain}
  priority text check (priority in ('critical', 'high', 'medium', 'low')),
  difficulty text check (difficulty in ('easy', 'moderate', 'complex')),
  new_steps jsonb default '[]'::jsonb,
  ai_handles text[] default '{}',
  human_decides text[] default '{}',
  phase int check (phase in (1, 2, 3, 4)),
  implementation jsonb, -- ImplementationGuide
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Assessments (company-wide, one per analysis run) ───
create table assessments (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  overall_score int check (overall_score >= 0 and overall_score <= 100),
  summary text,
  strengths text[] default '{}',
  improvements text[] default '{}',
  quick_wins text[] default '{}',
  estimated_impact text,
  created_at timestamptz default now()
);

-- ─── Roadmap Phases ───
create table roadmap_phases (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  assessment_id uuid references assessments(id) on delete cascade,
  phase int check (phase in (1, 2, 3, 4)),
  name text not null,
  duration text,
  description text,
  workflow_ids uuid[] default '{}',
  milestones text[] default '{}',
  created_at timestamptz default now()
);

-- ─── AI Chats (assistant conversation history) ───
create table ai_chats (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New AI chat',
  messages jsonb default '[]'::jsonb, -- array of {id, role, content}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Row Level Security ───

alter table companies enable row level security;
alter table users enable row level security;
alter table contributors enable row level security;
alter table interview_tokens enable row level security;
alter table interviews enable row level security;
alter table workflows enable row level security;
alter table workflow_contributors enable row level security;
alter table recommendations enable row level security;
alter table assessments enable row level security;
alter table roadmap_phases enable row level security;
alter table ai_chats enable row level security;

-- Users can only see their own company's data
create policy "Users see own company" on companies
  for select using (id in (select company_id from users where id = auth.uid()));

create policy "Users see own profile" on users
  for select using (id = auth.uid());

create policy "Users see own company contributors" on contributors
  for all using (company_id in (select company_id from users where id = auth.uid()));

create policy "Users see own company interviews" on interviews
  for all using (company_id in (select company_id from users where id = auth.uid()));

create policy "Users see own company workflows" on workflows
  for all using (company_id in (select company_id from users where id = auth.uid()));

create policy "Users see own company recommendations" on recommendations
  for all using (company_id in (select company_id from users where id = auth.uid()));

create policy "Users see own company assessments" on assessments
  for all using (company_id in (select company_id from users where id = auth.uid()));

-- Interview tokens are publicly readable (contributors access via token)
create policy "Public token lookup" on interview_tokens
  for select using (true);

-- Interviews can be created/updated by anyone with a valid token (no auth required)
create policy "Public interview access via token" on interviews
  for all using (
    token_id in (select id from interview_tokens)
  );

-- ─── Indexes ───
create index idx_users_company on users(company_id);
create index idx_contributors_company on contributors(company_id);
create index idx_interview_tokens_token on interview_tokens(token);
create index idx_interviews_company on interviews(company_id);
create index idx_interviews_token on interviews(token_id);
create index idx_workflows_company on workflows(company_id);
create index idx_recommendations_workflow on recommendations(workflow_id);

-- ─── Updated_at trigger ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at before update on companies
  for each row execute function update_updated_at();
create trigger workflows_updated_at before update on workflows
  for each row execute function update_updated_at();
create trigger recommendations_updated_at before update on recommendations
  for each row execute function update_updated_at();
