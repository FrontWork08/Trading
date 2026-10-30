create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null check (symbol = upper(symbol) and length(symbol) between 1 and 20),
  quantity numeric(24, 8) not null check (quantity > 0),
  average_price numeric(24, 8) not null check (average_price >= 0),
  updated_at timestamptz not null default now(),
  unique (owner_id, symbol)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null check (symbol = upper(symbol) and length(symbol) between 1 and 20),
  side text not null check (side in ('buy', 'sell')),
  quantity numeric(24, 8) not null check (quantity > 0),
  order_type text not null check (order_type in ('market', 'limit')),
  limit_price numeric(24, 8) check (limit_price is null or limit_price > 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'filled', 'cancelled', 'rejected')),
  created_at timestamptz not null default now(),
  check ((order_type = 'limit' and limit_price is not null) or (order_type = 'market' and limit_price is null))
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id),
  command text not null,
  target_id text not null,
  request_id text not null,
  outcome text not null check (outcome in ('requested', 'succeeded', 'failed')),
  occurred_at timestamptz not null default now()
);

create index portfolios_owner_id_idx on public.portfolios (owner_id);
create index positions_owner_id_idx on public.positions (owner_id);
create index orders_owner_created_idx on public.orders (owner_id, created_at desc);
create index audit_events_actor_created_idx on public.audit_events (actor_id, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.positions enable row level security;
alter table public.orders enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_self" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_self" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "portfolios_owner_access" on public.portfolios
  for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "positions_owner_access" on public.positions
  for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "orders_owner_access" on public.orders
  for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- Audit events are writable only by trusted server credentials and never by clients.
create policy "audit_events_service_role_only" on public.audit_events
  for all to service_role using (true) with check (true);

revoke all on public.profiles, public.portfolios, public.positions, public.orders, public.audit_events from anon, authenticated;
revoke all on public.audit_events from service_role;
grant insert on public.audit_events to service_role;
grant select, insert on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.portfolios, public.positions to authenticated;
grant select, insert on public.orders to authenticated;
