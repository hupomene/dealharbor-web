-- PactAnchor initial schema
-- Run this in Supabase SQL Editor or via Supabase migrations.

begin;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- updated_at helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  company_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- deals
-- ------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Deal',
  status text not null default 'draft'
    check (status in ('draft', 'generating', 'generated', 'signed', 'archived')),
  source text not null default 'db'
    check (source in ('local', 'db', 'migrated')),
  deal_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_deals_user_id on public.deals(user_id);
create index if not exists idx_deals_status on public.deals(status);
create index if not exists idx_deals_updated_at on public.deals(updated_at desc);

drop trigger if exists trg_deals_set_updated_at on public.deals;
create trigger trg_deals_set_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- documents
-- ------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  mime_type text not null default 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  storage_path text,
  status text not null default 'generated'
    check (status in ('queued', 'generated', 'failed')),
  generated_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_documents_deal_id on public.documents(deal_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_status on public.documents(status);
create index if not exists idx_documents_generated_at on public.documents(generated_at desc);

drop trigger if exists trg_documents_set_updated_at on public.documents;
create trigger trg_documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- auto-create profile on auth user creation
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ------------------------------------------------------------
-- healthcheck RPC
-- ------------------------------------------------------------
create or replace function public.healthcheck()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true,
    'database', current_database(),
    'schema', current_schema(),
    'server_time', timezone('utc', now()),
    'deals_count', (select count(*) from public.deals),
    'documents_count', (select count(*) from public.documents)
  );
$$;

grant execute on function public.healthcheck() to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.deals enable row level security;
alter table public.documents enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- deals policies
drop policy if exists "deals_select_own" on public.deals;
create policy "deals_select_own"
on public.deals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "deals_insert_own" on public.deals;
create policy "deals_insert_own"
on public.deals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "deals_update_own" on public.deals;
create policy "deals_update_own"
on public.deals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "deals_delete_own" on public.deals;
create policy "deals_delete_own"
on public.deals
for delete
to authenticated
using (auth.uid() = user_id);

-- documents policies
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
on public.documents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents
for delete
to authenticated
using (auth.uid() = user_id);

commit;