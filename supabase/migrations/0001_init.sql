-- SpendMirror initial schema: six user-owned tables, RLS, and canonical default categories.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  default_currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table public.gmail_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  encrypted_refresh_token text,
  last_sync_at timestamptz,
  status text not null default 'disconnected'
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  color text not null
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  gmail_message_id text not null,
  merchant text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'INR',
  txn_date date not null,
  category_id uuid references public.categories (id) on delete set null,
  transaction_type text not null,
  confidence numeric(4, 3) not null,
  status text not null,
  source_snippet text,
  constraint transactions_user_gmail_message_id_key unique (user_id, gmail_message_id),
  constraint transactions_transaction_type_check
    check (transaction_type in ('debit', 'credit', 'refund')),
  constraint transactions_status_check
    check (status in ('auto', 'review', 'edited')),
  constraint transactions_confidence_check
    check (confidence >= 0 and confidence <= 1),
  constraint transactions_amount_check
    check (amount > 0)
);

create table public.merchant_rules (
  user_id uuid not null references public.profiles (id) on delete cascade,
  merchant_pattern text not null,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (user_id, merchant_pattern)
);

create table public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  emails_scanned integer not null default 0,
  candidates_found integer not null default 0,
  extractions_attempted integer not null default 0,
  validation_failures integer not null default 0,
  duplicates_found integer not null default 0,
  transactions_saved integer not null default 0,
  review_items_created integer not null default 0,
  status text not null default 'running'
);

-- ---------------------------------------------------------------------------
-- Canonical default categories (shared; user_id is null)
-- ---------------------------------------------------------------------------

insert into public.categories (user_id, name, color)
values
  (null, 'Food & Dining', '#F97316'),
  (null, 'Groceries', '#22C55E'),
  (null, 'Shopping', '#EC4899'),
  (null, 'Transport', '#3B82F6'),
  (null, 'Bills & Utilities', '#EAB308'),
  (null, 'Entertainment', '#A855F7'),
  (null, 'Health', '#EF4444'),
  (null, 'Travel', '#14B8A6'),
  (null, 'Other', '#6B7280');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.gmail_connections enable row level security;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;
alter table public.merchant_rules enable row level security;
alter table public.pipeline_runs enable row level security;

-- profiles: ownership is profiles.id = auth.uid()

-- Lets a signed-in user read only the profile row whose id matches their auth user id.
create policy "Users can select their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Lets a signed-in user create their own profile row, and blocks inserting a row for anyone else.
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- Lets a signed-in user change only their own profile, and keeps the row owned by them after the update.
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Lets a signed-in user delete only their own profile row.
create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- gmail_connections: ownership is user_id = auth.uid()

-- Lets a signed-in user read only their Gmail connection row.
create policy "Users can select their own gmail connection"
  on public.gmail_connections
  for select
  to authenticated
  using (user_id = auth.uid());

-- Lets a signed-in user insert a Gmail connection only for themselves.
create policy "Users can insert their own gmail connection"
  on public.gmail_connections
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Lets a signed-in user update only their Gmail connection and prevents reassigning it to another user.
create policy "Users can update their own gmail connection"
  on public.gmail_connections
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lets a signed-in user delete only their Gmail connection row.
create policy "Users can delete their own gmail connection"
  on public.gmail_connections
  for delete
  to authenticated
  using (user_id = auth.uid());

-- transactions: ownership is user_id = auth.uid()

-- Lets a signed-in user read only transactions that belong to them.
create policy "Users can select their own transactions"
  on public.transactions
  for select
  to authenticated
  using (user_id = auth.uid());

-- Lets a signed-in user insert transactions only when user_id is their own auth user id.
create policy "Users can insert their own transactions"
  on public.transactions
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Lets a signed-in user update only their transactions and prevents moving a row to another user.
create policy "Users can update their own transactions"
  on public.transactions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lets a signed-in user delete only their own transaction rows.
create policy "Users can delete their own transactions"
  on public.transactions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- categories: own rows by user_id; shared defaults have user_id is null

-- Lets a signed-in user read their custom categories and the shared default categories (user_id is null).
create policy "Users can select own and default categories"
  on public.categories
  for select
  to authenticated
  using (user_id = auth.uid() or user_id is null);

-- Lets a signed-in user create custom categories only for themselves (not as global defaults).
create policy "Users can insert their own categories"
  on public.categories
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Lets a signed-in user update only their custom categories; default (null user_id) rows cannot be changed.
create policy "Users can update their own categories"
  on public.categories
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lets a signed-in user delete only their custom categories; shared defaults are not deletable by users.
create policy "Users can delete their own categories"
  on public.categories
  for delete
  to authenticated
  using (user_id = auth.uid());

-- merchant_rules: ownership is user_id = auth.uid()

-- Lets a signed-in user read only their merchant-to-category rules.
create policy "Users can select their own merchant rules"
  on public.merchant_rules
  for select
  to authenticated
  using (user_id = auth.uid());

-- Lets a signed-in user insert merchant rules only for themselves.
create policy "Users can insert their own merchant rules"
  on public.merchant_rules
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Lets a signed-in user update only their merchant rules and prevents reassigning them to another user.
create policy "Users can update their own merchant rules"
  on public.merchant_rules
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lets a signed-in user delete only their own merchant rules.
create policy "Users can delete their own merchant rules"
  on public.merchant_rules
  for delete
  to authenticated
  using (user_id = auth.uid());

-- pipeline_runs: ownership is user_id = auth.uid()

-- Lets a signed-in user read only their pipeline run metrics.
create policy "Users can select their own pipeline runs"
  on public.pipeline_runs
  for select
  to authenticated
  using (user_id = auth.uid());

-- Lets a signed-in user insert pipeline run rows only for themselves.
create policy "Users can insert their own pipeline runs"
  on public.pipeline_runs
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Lets a signed-in user update only their pipeline runs and prevents moving a row to another user.
create policy "Users can update their own pipeline runs"
  on public.pipeline_runs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lets a signed-in user delete only their own pipeline run rows.
create policy "Users can delete their own pipeline runs"
  on public.pipeline_runs
  for delete
  to authenticated
  using (user_id = auth.uid());
