begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

alter table public.deals
  add column if not exists title text,
  add column if not exists status text default 'draft',
  add column if not exists source text default 'db',
  add column if not exists deal_payload jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.deals
set
  title = coalesce(title, business_name, 'Untitled Deal'),
  status = coalesce(status, 'draft'),
  source = coalesce(source, 'db'),
  deal_payload = coalesce(
    deal_payload,
    jsonb_build_object(
      'business_name', business_name,
      'purchase_price', purchase_price,
      'down_payment', down_payment,
      'seller_financing', seller_financing
    )
  ),
  updated_at = coalesce(updated_at, created_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'deals_status_check'
  ) then
    alter table public.deals
      add constraint deals_status_check
      check (status in ('draft', 'generating', 'generated', 'signed', 'archived'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'deals_source_check'
  ) then
    alter table public.deals
      add constraint deals_source_check
      check (source in ('local', 'db', 'migrated'));
  end if;
end
$$;

drop trigger if exists trg_deals_set_updated_at on public.deals;
create trigger trg_deals_set_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();

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

alter table public.deals enable row level security;
alter table public.documents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'deals'
      and policyname = 'Users can update own deals'
  ) then
    create policy "Users can update own deals"
    on public.deals
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'deals'
      and policyname = 'Users can delete own deals'
  ) then
    create policy "Users can delete own deals"
    on public.deals
    for delete
    using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'Users can view own documents'
  ) then
    create policy "Users can view own documents"
    on public.documents
    for select
    using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'Users can insert own documents'
  ) then
    create policy "Users can insert own documents"
    on public.documents
    for insert
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'Users can update own documents'
  ) then
    create policy "Users can update own documents"
    on public.documents
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'Users can delete own documents'
  ) then
    create policy "Users can delete own documents"
    on public.documents
    for delete
    using (auth.uid() = user_id);
  end if;
end
$$;

commit;