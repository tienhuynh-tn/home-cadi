create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  friend_side text,
  attendance text not null,
  events text not null,
  guest_count integer,
  note text,
  wish_message text,
  created_at timestamptz not null default now(),
  constraint rsvps_attendance_check check (
    attendance in ('tham_du', 'chua_chac', 'khong_tham_du')
  ),
  constraint rsvps_friend_side_check check (
    friend_side is null or friend_side in ('co_dau', 'chu_re', 'ca_hai')
  ),
  constraint rsvps_events_check check (
    events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  ),
  constraint rsvps_guest_count_check check (
    guest_count is null or guest_count between 1 and 10
  ),
  constraint rsvps_wish_message_check check (
    wish_message is null or length(trim(wish_message)) between 1 and 240
  )
);

alter table rsvps add column if not exists wish_message text;
alter table rsvps add column if not exists friend_side text;

alter table rsvps drop constraint if exists rsvps_friend_side_check;
alter table rsvps
  add constraint rsvps_friend_side_check check (
    friend_side is null or friend_side in ('co_dau', 'chu_re', 'ca_hai')
  );

alter table rsvps drop constraint if exists rsvps_events_check;
alter table rsvps
  add constraint rsvps_events_check check (
    events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  );

alter table rsvps drop constraint if exists rsvps_wish_message_check;
alter table rsvps
  add constraint rsvps_wish_message_check check (
    wish_message is null or length(trim(wish_message)) between 1 and 240
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
  and friend_side in ('co_dau', 'chu_re', 'ca_hai')
  and attendance in ('tham_du', 'chua_chac', 'khong_tham_du')
  and events in ('ca_hai', 'nha_gai', 'nha_trai', 'chua_chac', 'khong_tham_du')
  and (guest_count is null or guest_count between 1 and 10)
  and (note is null or length(trim(note)) <= 240)
  and (wish_message is null or length(trim(wish_message)) between 1 and 240)
  and (attendance <> 'chua_chac' or length(trim(coalesce(note, ''))) between 1 and 240)
);

create or replace function public.get_public_rsvp_wishes(wish_limit integer default 30)
returns table (
  name text,
  wish_message text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    rsvps.name,
    rsvps.wish_message,
    rsvps.created_at
  from public.rsvps
  where rsvps.wish_message is not null
    and length(trim(rsvps.wish_message)) > 0
  order by rsvps.created_at desc
  limit least(greatest(coalesce(wish_limit, 30), 0), 30);
$$;

grant execute on function public.get_public_rsvp_wishes(integer) to anon, authenticated;

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
