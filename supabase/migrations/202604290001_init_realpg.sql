create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  coins integer not null default 0 check (coins >= 0),
  quests_completed integer not null default 0 check (quests_completed >= 0),
  streak integer not null default 0 check (streak >= 0),
  title text not null default 'Anfaenger',
  invite_code text not null unique,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  category text not null check (category in ('Sport', 'Lernen', 'Haushalt', 'Social', 'Sonstiges')),
  xp integer not null check (xp >= 0),
  coins integer not null check (coins >= 0),
  source text not null default 'daily' check (source in ('daily', 'custom', 'manual')),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quest_completions (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  proof_url text,
  ai_feedback text,
  completed_at timestamptz not null default now(),
  unique (quest_id, user_id)
);

create table if not exists public.inventory_items (
  id text primary key,
  name text not null,
  item_type text not null check (item_type in ('avatar', 'theme', 'buff', 'joker')),
  icon text not null,
  price integer not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  item_id text not null references public.inventory_items(id) on delete restrict,
  quantity integer not null default 1 check (quantity >= 0),
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.user_profiles(id) on delete cascade,
  to_user_id uuid not null references public.user_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_user_id, to_user_id),
  check (from_user_id <> to_user_id)
);

create table if not exists public.friends (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  friend_user_id uuid not null references public.user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_invite_code on public.user_profiles(invite_code);
create index if not exists idx_quests_user_status on public.quests(user_id, status);
create index if not exists idx_quest_completions_user on public.quest_completions(user_id, completed_at desc);
create index if not exists idx_user_inventory_user on public.user_inventory(user_id);
create index if not exists idx_friend_requests_to on public.friend_requests(to_user_id, status);
create index if not exists idx_friends_user on public.friends(user_id);

create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger trg_quests_updated_at
before update on public.quests
for each row execute function public.set_updated_at();

create trigger trg_user_inventory_updated_at
before update on public.user_inventory
for each row execute function public.set_updated_at();

create trigger trg_friend_requests_updated_at
before update on public.friend_requests
for each row execute function public.set_updated_at();

insert into public.inventory_items (id, name, item_type, icon, price)
values
  ('legendary_avatar', 'Legendary Avatar', 'avatar', 'crown', 100),
  ('golden_frame', 'Golden Frame', 'theme', 'star', 50),
  ('joker_card', 'Joker Card', 'joker', 'sparkles', 30),
  ('neon_theme', 'Neon Theme', 'theme', 'palette', 200),
  ('xp_booster', 'XP Booster', 'buff', 'zap', 150),
  ('coins_booster', 'Coins Booster', 'buff', 'coins', 100),
  ('streak_shield', 'Streak Shield', 'buff', 'shield', 75)
on conflict (id) do update
set
  name = excluded.name,
  item_type = excluded.item_type,
  icon = excluded.icon,
  price = excluded.price,
  is_active = true;

alter table public.user_profiles enable row level security;
alter table public.quests enable row level security;
alter table public.quest_completions enable row level security;
alter table public.user_inventory enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friends enable row level security;
alter table public.activity_feed enable row level security;

create policy "profiles_select_public_minimal"
on public.user_profiles
for select
using (true);

create policy "profiles_insert_own"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_delete_own"
on public.user_profiles
for delete
using (auth.uid() = id);

create policy "quests_select_own"
on public.quests
for select
using (auth.uid() = user_id);

create policy "quests_insert_own"
on public.quests
for insert
with check (auth.uid() = user_id);

create policy "quests_update_own"
on public.quests
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "quests_delete_own"
on public.quests
for delete
using (auth.uid() = user_id);

create policy "quest_completions_select_own"
on public.quest_completions
for select
using (auth.uid() = user_id);

create policy "quest_completions_insert_own"
on public.quest_completions
for insert
with check (auth.uid() = user_id);

create policy "user_inventory_select_own"
on public.user_inventory
for select
using (auth.uid() = user_id);

create policy "user_inventory_insert_own"
on public.user_inventory
for insert
with check (auth.uid() = user_id);

create policy "user_inventory_update_own"
on public.user_inventory
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "friend_requests_select_participant"
on public.friend_requests
for select
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "friend_requests_insert_sender"
on public.friend_requests
for insert
with check (auth.uid() = from_user_id);

create policy "friend_requests_update_receiver"
on public.friend_requests
for update
using (auth.uid() = to_user_id)
with check (auth.uid() = to_user_id);

create policy "friends_select_participant"
on public.friends
for select
using (auth.uid() = user_id or auth.uid() = friend_user_id);

create policy "activity_feed_select_own"
on public.activity_feed
for select
using (auth.uid() = user_id);

create policy "activity_feed_insert_own"
on public.activity_feed
for insert
with check (auth.uid() = user_id);

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_code text := '';
  i integer := 0;
begin
  while i < 8 loop
    out_code := out_code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    i := i + 1;
  end loop;
  return out_code;
end;
$$;

create or replace function public.ensure_profile(p_nickname text default 'Held')
returns public.user_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.user_profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_profiles (id, nickname, invite_code)
  values (v_uid, coalesce(nullif(trim(p_nickname), ''), 'Held'), public.generate_invite_code())
  on conflict (id) do nothing;

  select * into v_profile from public.user_profiles where id = v_uid;
  return v_profile;
end;
$$;

grant execute on function public.ensure_profile(text) to anon, authenticated;

create or replace function public.purchase_item(p_item_id text)
returns table(item_id text, quantity integer, remaining_coins integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_price integer;
  v_coins integer;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select price into v_price
  from public.inventory_items
  where id = p_item_id and is_active = true;

  if v_price is null then
    raise exception 'Item not found';
  end if;

  select coins into v_coins
  from public.user_profiles
  where id = v_uid
  for update;

  if v_coins is null then
    raise exception 'Profile missing';
  end if;

  if v_coins < v_price then
    raise exception 'Not enough coins';
  end if;

  update public.user_profiles
  set coins = coins - v_price
  where id = v_uid;

  insert into public.user_inventory (user_id, item_id, quantity)
  values (v_uid, p_item_id, 1)
  on conflict (user_id, item_id)
  do update set quantity = public.user_inventory.quantity + 1;

  return query
  select ui.item_id, ui.quantity, up.coins
  from public.user_inventory ui
  join public.user_profiles up on up.id = ui.user_id
  where ui.user_id = v_uid and ui.item_id = p_item_id;
end;
$$;

grant execute on function public.purchase_item(text) to authenticated;

create or replace function public.complete_quest(p_quest_id uuid, p_feedback text default null)
returns table(quest_id uuid, new_level integer, new_xp integer, new_coins integer, quests_completed integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_q record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id, xp, coins, status
  into v_q
  from public.quests
  where id = p_quest_id and user_id = v_uid
  for update;

  if v_q.id is null then
    raise exception 'Quest not found';
  end if;

  if v_q.status = 'completed' then
    raise exception 'Quest already completed';
  end if;

  update public.quests
  set status = 'completed'
  where id = p_quest_id and user_id = v_uid;

  insert into public.quest_completions (quest_id, user_id, ai_feedback)
  values (p_quest_id, v_uid, p_feedback)
  on conflict (quest_id, user_id) do nothing;

  update public.user_profiles
  set
    xp = xp + v_q.xp,
    coins = coins + v_q.coins,
    quests_completed = quests_completed + 1,
    streak = greatest(streak, 1)
  where id = v_uid;

  return query
  select p_quest_id, up.level, up.xp, up.coins, up.quests_completed
  from public.user_profiles up
  where up.id = v_uid;
end;
$$;

grant execute on function public.complete_quest(uuid, text) to authenticated;

create or replace function public.send_friend_request(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target uuid;
  v_request_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_target
  from public.user_profiles
  where invite_code = upper(trim(p_invite_code))
  limit 1;

  if v_target is null then
    raise exception 'Invite code not found';
  end if;

  if v_target = v_uid then
    raise exception 'Cannot friend yourself';
  end if;

  if exists (
    select 1 from public.friends
    where user_id = v_uid and friend_user_id = v_target
  ) then
    raise exception 'Already friends';
  end if;

  insert into public.friend_requests (from_user_id, to_user_id, status)
  values (v_uid, v_target, 'pending')
  on conflict (from_user_id, to_user_id)
  do update set status = 'pending', updated_at = now()
  returning id into v_request_id;

  return v_request_id;
end;
$$;

grant execute on function public.send_friend_request(text) to authenticated;

create or replace function public.accept_friend_request(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_req
  from public.friend_requests
  where id = p_request_id and to_user_id = v_uid and status = 'pending'
  for update;

  if v_req.id is null then
    raise exception 'Request not found';
  end if;

  update public.friend_requests
  set status = 'accepted'
  where id = p_request_id;

  insert into public.friends (user_id, friend_user_id)
  values
    (v_req.from_user_id, v_req.to_user_id),
    (v_req.to_user_id, v_req.from_user_id)
  on conflict do nothing;

  return true;
end;
$$;

grant execute on function public.accept_friend_request(uuid) to authenticated;

create or replace view public.leaderboard as
select
  up.id,
  up.nickname,
  up.level,
  up.quests_completed,
  up.streak,
  up.title
from public.user_profiles up
order by up.level desc, up.quests_completed desc, up.streak desc;

