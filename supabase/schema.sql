-- ============================================================
-- AIR CHALO CG-2409 — "The Goa Game" schema
-- Project: ehjzdoxgusdctroxposg
-- ============================================================
-- Identity model: PICK-YOUR-SEAT (no passwords).
-- The 5 friend profiles are seeded; a passenger just selects
-- their seat. Security is "friendly" — anon key is public.
-- RLS below permits anon read/write for this private trip.
-- Tighten later with Supabase Auth if desired.

-- ---------- profiles ----------
create table if not exists public.profiles (
  id          text primary key,            -- friend id (kareem, sushant, ...)
  name        text not null,
  avatar      text,                        -- emoji
  seat        text not null,               -- e.g. 1A
  chaos_miles integer not null default 0,
  level       integer not null default 1,
  votes_recv  integer not null default 0,
  missions_done integer not null default 0,
  predictions_won integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- activities (live feed) ----------
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references public.profiles(id),
  type        text not null,               -- mission_complete, vote, achievement, photo, level_up, join
  points      integer default 0,
  text        text,
  meta        jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists activities_created_idx on public.activities (created_at desc);

-- ---------- games / most likely ----------
create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  game_type   text not null,               -- most_likely, poll, etc.
  status      text not null default 'open', -- open | closed | revealed
  starts_at   timestamptz default now(),
  ends_at     timestamptz
);
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  game_id     uuid references public.games(id) on delete cascade,
  text        text not null,
  round       integer not null default 1,
  created_at  timestamptz not null default now()
);
create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  voter_id    text references public.profiles(id),
  selected_id text references public.profiles(id),
  created_at  timestamptz not null default now(),
  unique (question_id, voter_id)
);

-- ---------- missions ----------
create table if not exists public.missions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  points      integer not null default 100,
  mtype       text not null default 'secret', -- secret | team | personal
  prompt      text
);
create table if not exists public.user_missions (
  user_id     text references public.profiles(id),
  mission_id  uuid references public.missions(id) on delete cascade,
  status      text not null default 'assigned', -- assigned | done
  evidence_url text,
  created_at  timestamptz not null default now(),
  primary key (user_id, mission_id)
);

-- ---------- daily polls ----------
create table if not exists public.daily_polls (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  options     jsonb not null,              -- ["Cocktail bar","Beach",...]
  closes_at   timestamptz,
  status      text not null default 'open'
);
create table if not exists public.poll_votes (
  poll_id     uuid references public.daily_polls(id) on delete cascade,
  user_id     text references public.profiles(id),
  option      integer not null,
  created_at  timestamptz not null default now(),
  primary key (poll_id, user_id)
);

-- ---------- achievements / passport ----------
create table if not exists public.achievements (
  id          text primary key,            -- e.g. one_last_drink
  name        text not null,
  description text,
  icon        text
);
create table if not exists public.user_achievements (
  user_id     text references public.profiles(id),
  achievement_id text references public.achievements(id),
  created_at  timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create table if not exists public.passport_stamps (
  user_id     text references public.profiles(id),
  stamp_id    text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, stamp_id)
);

-- ---------- photos / evidence ----------
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references public.profiles(id),
  image_url   text,
  caption     text,
  day         integer,
  created_at  timestamptz not null default now()
);
create table if not exists public.photo_votes (
  photo_id    uuid references public.photos(id) on delete cascade,
  user_id     text references public.profiles(id),
  created_at  timestamptz not null default now(),
  primary key (photo_id, user_id)
);

-- ---------- predictions ----------
create table if not exists public.predictions (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  result_id   text,                         -- profile id of actual result (set by admin)
  closes_at   timestamptz,
  status      text not null default 'open'
);
create table if not exists public.prediction_votes (
  prediction_id uuid references public.predictions(id) on delete cascade,
  user_id     text references public.profiles(id),
  pick_id     text references public.profiles(id),
  primary key (prediction_id, user_id)
);

-- ---------- bingo ----------
create table if not exists public.bingo_squares (
  idx         integer primary key,          -- 0..24
  label       text not null,
  icon        text
);
create table if not exists public.bingo_marks (
  user_id     text references public.profiles(id),
  idx         integer references public.bingo_squares(idx),
  primary key (user_id, idx)
);

-- ---------- enable realtime ----------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
alter publication supabase_realtime add table
  public.activities, public.games, public.questions, public.votes,
  public.user_missions, public.daily_polls, public.poll_votes,
  public.user_achievements, public.passport_stamps, public.photos,
  public.photo_votes, public.predictions, public.prediction_votes,
  public.bingo_marks, public.profiles;

-- ---------- RLS (friendly / private) ----------
alter table public.profiles            enable row level security;
alter table public.activities          enable row level security;
alter table public.games               enable row level security;
alter table public.questions           enable row level security;
alter table public.votes               enable row level security;
alter table public.missions            enable row level security;
alter table public.user_missions       enable row level security;
alter table public.daily_polls         enable row level security;
alter table public.poll_votes          enable row level security;
alter table public.achievements        enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.passport_stamps     enable row level security;
alter table public.photos              enable row level security;
alter table public.photo_votes         enable row level security;
alter table public.predictions         enable row level security;
alter table public.prediction_votes    enable row level security;
alter table public.bingo_squares       enable row level security;
alter table public.bingo_marks         enable row level security;

-- Permissive policies for this private friend group (anon key is public).
-- Replace with auth-based policies if you later add logins.
create policy "anon all" on public.profiles            for all using (true) with check (true);
create policy "anon all" on public.activities          for all using (true) with check (true);
create policy "anon all" on public.games               for all using (true) with check (true);
create policy "anon all" on public.questions           for all using (true) with check (true);
create policy "anon all" on public.votes               for all using (true) with check (true);
create policy "anon all" on public.missions            for all using (true) with check (true);
create policy "anon all" on public.user_missions       for all using (true) with check (true);
create policy "anon all" on public.daily_polls         for all using (true) with check (true);
create policy "anon all" on public.poll_votes          for all using (true) with check (true);
create policy "anon all" on public.achievements        for all using (true) with check (true);
create policy "anon all" on public.user_achievements   for all using (true) with check (true);
create policy "anon all" on public.passport_stamps     for all using (true) with check (true);
create policy "anon all" on public.photos              for all using (true) with check (true);
create policy "anon all" on public.photo_votes         for all using (true) with check (true);
create policy "anon all" on public.predictions         for all using (true) with check (true);
create policy "anon all" on public.prediction_votes    for all using (true) with check (true);
create policy "anon all" on public.bingo_squares       for all using (true) with check (true);
create policy "anon all" on public.bingo_marks         for all using (true) with check (true);

-- ---------- storage bucket for evidence/photos ----------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;
