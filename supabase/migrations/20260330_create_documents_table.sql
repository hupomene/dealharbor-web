create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null default 'docx' check (file_type in ('docx', 'pdf', 'zip')),
  file_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.documents
  add column if not exists file_name text;

alter table public.documents
  add column if not exists file_type text not null default 'docx';

alter table public.documents
  add column if not exists file_url text not null default '';

alter table public.documents
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_documents_deal_id on public.documents(deal_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_created_at on public.documents(created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents
for insert
with check (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents
for delete
using (auth.uid() = user_id);