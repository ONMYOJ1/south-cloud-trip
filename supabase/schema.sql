create extension if not exists pgcrypto;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  invite_code_hash text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  unique (trip_id, auth_user_id)
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_date date not null,
  title text not null,
  place text not null,
  details jsonb not null default '[]'::jsonb,
  status text not null default 'planned',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.car_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  subtitle text,
  seats text,
  rental_dates text,
  price text,
  deposit text,
  note text,
  link text,
  created_by uuid references public.members(id),
  created_at timestamptz not null default now()
);

create table if not exists public.stay_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  night text not null,
  city text not null,
  title text not null,
  location text,
  price text,
  detail text,
  link text,
  selected boolean not null default false,
  created_by uuid references public.members(id),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  target_type text not null check (target_type in ('car', 'stay')),
  target_id uuid not null,
  value text not null check (value in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (member_id, target_type, target_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  target_type text not null check (target_type in ('car', 'stay')),
  target_id uuid not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create or replace function public.is_trip_member(target_trip uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where trip_id = target_trip and auth_user_id = auth.uid());
$$;

create or replace function public.is_trip_admin(target_trip uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where trip_id = target_trip and auth_user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.join_trip(target_trip uuid, invite_code text, nickname text)
returns public.members language plpgsql security definer set search_path = public as $$
declare
  joined_member public.members;
begin
  if not exists (select 1 from public.trips where id = target_trip and crypt(invite_code, invite_code_hash) = invite_code_hash) then
    raise exception 'invalid invite code';
  end if;
  insert into public.members (trip_id, auth_user_id, display_name)
  values (target_trip, auth.uid(), nickname)
  on conflict (trip_id, auth_user_id) do update set display_name = excluded.display_name
  returning * into joined_member;
  return joined_member;
end;
$$;

alter table public.trips enable row level security;
alter table public.members enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.car_options enable row level security;
alter table public.stay_options enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

create policy "members can view their trips" on public.trips for select using (public.is_trip_member(id));
create policy "members can view member list" on public.members for select using (public.is_trip_member(trip_id));
create policy "members can view itinerary" on public.itinerary_items for select using (public.is_trip_member(trip_id));
create policy "admins manage itinerary" on public.itinerary_items for all using (public.is_trip_admin(trip_id)) with check (public.is_trip_admin(trip_id));
create policy "members view car options" on public.car_options for select using (public.is_trip_member(trip_id));
create policy "members add car options" on public.car_options for insert with check (public.is_trip_member(trip_id));
create policy "admins manage car options" on public.car_options for update using (public.is_trip_admin(trip_id)) with check (public.is_trip_admin(trip_id));
create policy "admins delete car options" on public.car_options for delete using (public.is_trip_admin(trip_id));
create policy "members view stay options" on public.stay_options for select using (public.is_trip_member(trip_id));
create policy "members add stay options" on public.stay_options for insert with check (public.is_trip_member(trip_id));
create policy "admins manage stay options" on public.stay_options for update using (public.is_trip_admin(trip_id)) with check (public.is_trip_admin(trip_id));
create policy "admins delete stay options" on public.stay_options for delete using (public.is_trip_admin(trip_id));
create policy "members view votes" on public.votes for select using (public.is_trip_member(trip_id));
create policy "members manage own votes" on public.votes for all using (member_id in (select id from public.members where auth_user_id = auth.uid())) with check (member_id in (select id from public.members where auth_user_id = auth.uid()));
create policy "members view comments" on public.comments for select using (public.is_trip_member(trip_id));
create policy "members add comments" on public.comments for insert with check (member_id in (select id from public.members where auth_user_id = auth.uid()) and public.is_trip_member(trip_id));
create policy "members delete own comments" on public.comments for delete using (member_id in (select id from public.members where auth_user_id = auth.uid()));

alter publication supabase_realtime add table public.itinerary_items, public.car_options, public.stay_options, public.votes, public.comments;

-- Generate a trip invite hash with:
-- select crypt('replace-with-a-long-invite-code', gen_salt('bf'));
