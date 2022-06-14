drop table if exists public.users cascade;
create table public.users (
  id uuid primary key not null,
  name varchar(255) not null,
  email varchar(255) unique not null,
  created_at timestamptz default now()
);

drop table if exists public.workspaces cascade;
create table public.workspaces (
  id serial primary key,
  name varchar(255) not null,
  owner_id uuid references users(id) not null,
  created_at timestamptz default now()
);

drop type if exists workspace_permission cascade;
create type workspace_permission as enum ('owner', 'member', 'viewer');

drop table if exists public.members cascade;
create table public.members (
  workspace_id integer references workspaces(id) not null,
  user_id uuid references users(id) not null,
  role workspace_permission not null, 
  created_at timestamptz default now()
);

drop table if exists public.tables cascade;
create table public.tables (
  id serial primary key,
  name varchar(255) not null,
  workspace_id integer references workspaces(id) not null,
  created_at timestamptz default now()
);

drop type if exists column_type cascade;
create type column_type as enum ('text', 'number', 'url', 'date', 'checkbox', 'dropdown', 'chips');

drop table if exists public.columns cascade;
create table public.columns (
  id serial primary key,
  name varchar(255) not null,
  type column_type default 'text',
  tags text[],
  dropdown_options text[],
  table_id integer references tables(id) not null,
  workspace_id integer references workspaces(id) not null,
  created_at timestamptz default now()
);

drop table if exists public.rows cascade;
create table public.rows (
  id serial primary key,
  table_id integer references tables(id) not null,
  workspace_id integer references workspaces(id) not null,
  rank text,
  created_at timestamptz default now()
);

drop table if exists public.cells cascade;
create table public.cells (
  workspace_id integer references workspaces(id) not null,
  table_id integer references tables(id) not null,
  column_id integer references columns(id) not null,
  row_id integer references rows(id) not null,
  value text,
  created_at timestamptz default now(),
  primary key(column_id, row_id)
);
