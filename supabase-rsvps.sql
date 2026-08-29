create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attendance text not null,
  events text not null,
  guest_count integer,
  note text,
  created_at timestamptz not null default now(),
  constraint rsvps_attendance_check check (
    attendance in ('tham_du', 'chua_chac', 'khong_tham_du')
  ),
  constraint rsvps_events_check check (
    events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  ),
  constraint rsvps_guest_count_check check (
    guest_count is null or guest_count between 1 and 10
  )
);

alter table rsvps drop constraint if exists rsvps_events_check;
alter table rsvps
  add constraint rsvps_events_check check (
    events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  );

create table if not exists rsvp_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table rsvps enable row level security;
alter table rsvp_admins enable row level security;

create or replace function public.is_rsvp_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.rsvp_admins
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_rsvp_admin() to anon, authenticated;

drop policy if exists "Anyone can add RSVP" on rsvps;
create policy "Anyone can add RSVP"
on rsvps for insert
with check (
  length(trim(name)) between 1 and 60
  and attendance in ('tham_du', 'chua_chac', 'khong_tham_du')
  and events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  and (guest_count is null or guest_count between 1 and 10)
  and (note is null or length(trim(note)) <= 240)
  and (attendance <> 'chua_chac' or length(trim(coalesce(note, ''))) between 1 and 240)
);

drop policy if exists "Admins can read RSVP" on rsvps;
create policy "Admins can read RSVP"
on rsvps for select
using (public.is_rsvp_admin());

drop policy if exists "Admins can read admin list" on rsvp_admins;
create policy "Admins can read admin list"
on rsvp_admins for select
using (user_id = auth.uid());

-- After creating the Supabase Auth admin user, add their auth.users.id:
-- insert into rsvp_admins (user_id) values ('00000000-0000-0000-0000-000000000000');
