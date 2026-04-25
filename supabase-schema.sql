-- ═══════════════════════════════════════════════════════════════════════════
-- Eventrip — Schéma Supabase
-- Copiez-collez ce SQL dans l'éditeur SQL de votre projet Supabase
-- dashboard.supabase.com → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- pour les requêtes géographiques

-- ─── Profils utilisateurs ────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  first_name  text,
  last_name   text,
  phone       text,
  avatar_url  text,
  preferences jsonb default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Sessions de recherche (paniers en cours) ────────────────────────────────
create table if not exists search_sessions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references profiles(id) on delete set null,
  event_id       text not null,              -- ID Ticketmaster
  event_date     date,
  departure_city text,
  adults         int  default 1,
  nights         int  default 2,
  flights_count  int  default 0,
  hotels_count   int  default 0,
  fallbacks      text[] default '{}',        -- composants en mode dégradé
  event_available boolean,
  last_checked   timestamptz,
  created_at     timestamptz default now(),
  expires_at     timestamptz default (now() + interval '24 hours')
);

create index if not exists idx_sessions_user   on search_sessions(user_id);
create index if not exists idx_sessions_event  on search_sessions(event_id);
create index if not exists idx_sessions_expiry on search_sessions(expires_at);

-- ─── Packs réservés ──────────────────────────────────────────────────────────
create table if not exists packages (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references profiles(id) on delete set null,
  session_id       uuid references search_sessions(id) on delete set null,
  event_id         text not null,
  event_name       text,
  event_date       date,
  venue_name       text,
  venue_city       text,
  venue_lat        numeric(10,7),
  venue_lng        numeric(10,7),
  -- Billet
  ticket_zone      text,
  ticket_price     numeric(10,2),
  -- Transport
  flight_id        text,
  flight_airline   text,
  flight_departure text,    -- IATA départ
  flight_arrival   text,    -- IATA arrivée
  flight_dep_time  timestamptz,
  flight_arr_time  timestamptz,
  flight_price     numeric(10,2),
  -- Hôtel
  hotel_id         text,
  hotel_name       text,
  hotel_city       text,
  hotel_stars      int,
  hotel_distance   numeric(6,2),  -- km du venue
  hotel_check_in   date,
  hotel_check_out  date,
  hotel_price      numeric(10,2), -- total nuits
  -- Pack
  adults           int  default 1,
  nights           int  default 2,
  total_price      numeric(10,2),
  currency         text default 'EUR',
  service_fee      numeric(10,2) default 15,
  status           text default 'draft'  -- draft | confirmed | cancelled | refunded
    check (status in ('draft','confirmed','cancelled','refunded')),
  stripe_intent_id text,
  confirmed_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_packages_user   on packages(user_id);
create index if not exists idx_packages_event  on packages(event_id);
create index if not exists idx_packages_status on packages(status);

-- ─── Voyageurs (passagers d'un pack) ─────────────────────────────────────────
create table if not exists passengers (
  id            uuid primary key default uuid_generate_v4(),
  package_id    uuid references packages(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text,
  date_of_birth date,
  nationality   text,
  passport_no   text,
  created_at    timestamptz default now()
);

create index if not exists idx_passengers_pkg on passengers(package_id);

-- ─── Alertes de disponibilité ────────────────────────────────────────────────
create table if not exists availability_alerts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  event_id   text not null,
  event_name text,
  type       text not null  -- price_drop | back_in_stock | event_cancelled
    check (type in ('price_drop','back_in_stock','event_cancelled','rescheduled')),
  message    text,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table search_sessions   enable row level security;
alter table packages           enable row level security;
alter table passengers         enable row level security;
alter table availability_alerts enable row level security;

-- Policies profiles
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Policies packages
create policy "Users can view their packages"
  on packages for select using (auth.uid() = user_id);
create policy "Users can create packages"
  on packages for insert with check (auth.uid() = user_id);
create policy "Users can update draft packages"
  on packages for update using (auth.uid() = user_id and status = 'draft');

-- Policies sessions (lecture/écriture sans auth pour les paniers anonymes)
create policy "Anyone can create sessions"
  on search_sessions for insert with check (true);
create policy "Anyone can read their session by id"
  on search_sessions for select using (true);
create policy "Anyone can update their session"
  on search_sessions for update using (true);

-- ─── Fonctions utilitaires ────────────────────────────────────────────────────
-- Nettoyer les sessions expirées (à scheduler via pg_cron ou edge function)
create or replace function cleanup_expired_sessions()
returns void language plpgsql as $$
begin
  delete from search_sessions where expires_at < now();
end;
$$;

-- Trigger : mettre à jour updated_at automatiquement
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_packages_updated_at
  before update on packages
  for each row execute function set_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
