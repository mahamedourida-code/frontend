create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 120),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companies_workspace_name_unique
  on public.companies (workspace_id, lower(name));

create unique index if not exists companies_workspace_default_unique
  on public.companies (workspace_id)
  where is_default;

create index if not exists companies_workspace_id_idx
  on public.companies (workspace_id);

create or replace function public.create_default_company_for_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.companies (workspace_id, name, is_default)
  values (new.id, 'General', true)
  on conflict do nothing;
  return new;
end;
$$;

revoke execute on function public.create_default_company_for_workspace() from public, anon, authenticated;

drop trigger if exists create_default_company_after_workspace_insert on public.workspaces;
create trigger create_default_company_after_workspace_insert
  after insert on public.workspaces
  for each row
  execute function public.create_default_company_for_workspace();

alter table public.companies enable row level security;

drop policy if exists "Workspace owners can view companies" on public.companies;
create policy "Workspace owners can view companies"
  on public.companies
  for select
  using (
    exists (
      select 1
      from public.workspaces
      where workspaces.id = companies.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "Workspace owners can create companies" on public.companies;
create policy "Workspace owners can create companies"
  on public.companies
  for insert
  with check (
    exists (
      select 1
      from public.workspaces
      where workspaces.id = companies.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "Workspace owners can update companies" on public.companies;
create policy "Workspace owners can update companies"
  on public.companies
  for update
  using (
    exists (
      select 1
      from public.workspaces
      where workspaces.id = companies.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workspaces
      where workspaces.id = companies.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists "Workspace owners can delete companies" on public.companies;
create policy "Workspace owners can delete companies"
  on public.companies
  for delete
  using (
    exists (
      select 1
      from public.workspaces
      where workspaces.id = companies.workspace_id
        and workspaces.owner_user_id = (select auth.uid())
    )
  );

alter table public.job_documents
  add column if not exists company_id uuid references public.companies(id) on delete set null;

alter table public.accounts_payable_items
  add column if not exists company_id uuid references public.companies(id) on delete set null;

create index if not exists job_documents_company_id_idx
  on public.job_documents (company_id);

create index if not exists accounts_payable_items_company_id_idx
  on public.accounts_payable_items (company_id);

update public.companies
set is_default = true,
    updated_at = now()
where lower(name) = 'general'
  and not is_default
  and not exists (
    select 1
    from public.companies as existing_default
    where existing_default.workspace_id = companies.workspace_id
      and existing_default.is_default
  );

insert into public.companies (workspace_id, name, is_default)
select workspaces.id, 'General', true
from public.workspaces
where not exists (
  select 1
  from public.companies
  where companies.workspace_id = workspaces.id
    and companies.is_default
);

update public.job_documents
set company_id = companies.id
from public.companies
where job_documents.workspace_id = companies.workspace_id
  and companies.is_default
  and job_documents.company_id is null;

update public.accounts_payable_items
set company_id = companies.id
from public.companies
where accounts_payable_items.workspace_id = companies.workspace_id
  and companies.is_default
  and accounts_payable_items.company_id is null;
