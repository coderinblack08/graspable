-- handle new user trigger

-- create or replace function public.handle_new_user()
--   returns trigger 
--   language plpgsql 
--   security definer 
--   set search_path = public
--   as $$
--     begin
--       insert into public.users (id)
--       values (new.id);
--       return new;
--     end;
--   $$;

-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- users

alter table users enable row level security;

create policy "anyone can view their user profiles"
  on public.users
  for select using ( true );

create policy "users can create their own profiles"
  on public.users
  for insert
  with check ( auth.uid() = id );

create policy "users can update own profile"
  on public.users for update
  to authenticated
  using ( auth.uid() = id );

create or replace function get_workspaces_for_authenticated_user(
  exclude_viewers boolean default true
)
returns setof bigint
language sql
security definer
set search_path = public
stable
as $$
  select workspace_id from public.members
  where user_id = auth.uid()
  and case when exclude_viewers then role != 'viewer' else true end
$$;

-- workspaces

alter table workspaces enable row level security;

create policy "verify owner_id on workspaces"
  on public.workspaces
  for insert 
  with check ( auth.uid() = owner_id );

create policy "all members can view workspaces"
  on public.workspaces
  for select
  to authenticated
  using ( id in (select get_workspaces_for_authenticated_user(false)) );

create policy "members can update workspaces"
  on public.workspaces
  for update
  to authenticated
  using ( id in (select get_workspaces_for_authenticated_user()) );

create policy "only owner can delete workspace"
  on public.workspaces
  for delete
  to authenticated
  using ( auth.uid() = owner_id );

-- trigger for inserting into public.workspaces

create function public.handle_new_workspace() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.members (workspace_id, user_id, role)
  values (new.id, auth.uid(), 'owner');
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute procedure public.handle_new_workspace();

-- tables

alter table tables enable row level security;

create policy "all members can view tables"
  on public.tables
  for select
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user(false)) );

create policy "members can create tables"
  on public.tables
  for insert
  to authenticated
  with check ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can update tables"
  on public.tables
  for update
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can delete tables"
  on public.tables
  for delete
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

-- rows

alter table "rows" enable row level security;

create policy "all members can view rows"
  on public.rows
  for select
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user(false)) );

create policy "members can create rows"
  on public.rows
  for insert
  to authenticated
  with check ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can update rows"
  on public.rows
  for update
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can delete rows"
  on public.rows
  for delete
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

-- columns

alter table "columns" enable row level security;

create policy "all members can view columns"
  on public.columns
  for select
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user(false)) );

create policy "members can create columns"
  on public.columns
  for insert
  to authenticated
  with check ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can update columns"
  on public.columns
  for update
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can delete columns"
  on public.columns
  for delete
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

-- cells

alter table "cells" enable row level security;

create policy "all members can view cells"
  on public.cells
  for select
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user(false)) );

create policy "members can create cells"
  on public.cells
  for insert
  to authenticated
  with check ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can update cells"
  on public.cells
  for update
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );

create policy "members can delete cells"
  on public.cells
  for delete
  to authenticated
  using ( workspace_id in (select get_workspaces_for_authenticated_user()) );