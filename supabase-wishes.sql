create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table wishes enable row level security;

drop policy if exists "Anyone can read wishes" on wishes;
create policy "Anyone can read wishes"
on wishes for select
using (true);

drop policy if exists "Anyone can add wishes" on wishes;
create policy "Anyone can add wishes"
on wishes for insert
with check (
  length(trim(name)) between 1 and 60
  and length(trim(message)) between 1 and 500
);
