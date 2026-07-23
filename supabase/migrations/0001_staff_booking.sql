-- ══════════════════════════════════════════════════════════════════════
-- HAVN staff-based booking system — schema, constraints, indexes, RLS.
-- Named `appointments` (not `bookings`) to coexist with the legacy simple
-- booking table. Apply in the Supabase SQL editor or via the CLI.
-- ══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists btree_gist;  -- gist equality on text + range &&

-- ── updated_at helper ──────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── catalog (mirrors lib/booking/data/*; managed as config-as-code today,
--    these tables exist for future DB-backed admin editing) ─────────────
create table if not exists services (
  id                    text primary key,
  name                  text not null,
  slug                  text unique not null,
  category              text not null,
  description           text not null default '',
  price_cents           integer not null check (price_cents >= 0),
  duration_minutes      integer not null check (duration_minutes > 0),
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes >= 0),
  buffer_after_minutes  integer not null default 0 check (buffer_after_minutes >= 0),
  deposit_type          text not null default 'none' check (deposit_type in ('fixed','percent','none')),
  deposit_value         numeric not null default 0 check (deposit_value >= 0),
  active                boolean not null default true
);

create table if not exists staff (
  id               text primary key,
  name             text not null,
  slug             text unique not null,
  title            text not null default '',
  bio              text not null default '',
  image_url        text not null default '',
  specialties      text[] not null default '{}',
  years_experience integer,
  active           boolean not null default true
);

create table if not exists staff_services (
  staff_id   text not null references staff(id) on delete cascade,
  service_id text not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table if not exists staff_availability (
  id          uuid primary key default gen_random_uuid(),
  staff_id    text not null references staff(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  active      boolean not null default true,
  check (start_time < end_time)
);

create table if not exists staff_breaks (
  id          uuid primary key default gen_random_uuid(),
  staff_id    text not null references staff(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  check (start_time < end_time)
);

create table if not exists staff_time_off (
  id        uuid primary key default gen_random_uuid(),
  staff_id  text not null references staff(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at   timestamptz not null,
  reason    text,
  check (starts_at < ends_at)
);

create table if not exists booking_policies (
  id         text primary key,
  title      text not null,
  summary    text not null,
  full_text  text not null,
  version    text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── appointments (the dynamic, protected data) ─────────────────────────
-- service_id / staff_id are intentionally plain text (not FK-constrained) so
-- bookings never depend on whether the catalog tables are seeded; the app
-- validates them against the config catalog before insert.
create table if not exists appointments (
  id                         uuid primary key default gen_random_uuid(),
  confirmation_number        text unique not null,
  service_id                 text not null,
  staff_id                   text not null,
  customer_first_name        text not null,
  customer_last_name         text not null,
  customer_email             text not null,
  customer_phone             text not null,
  customer_notes             text,
  starts_at                  timestamptz not null,
  ends_at                    timestamptz not null,
  block_starts_at            timestamptz not null,
  block_ends_at              timestamptz not null,
  status                     text not null default 'pending_payment'
                               check (status in ('pending_payment','confirmed','cancelled','completed','no_show','payment_failed','expired')),
  service_price_cents        integer not null check (service_price_cents >= 0),
  deposit_amount_cents       integer not null default 0 check (deposit_amount_cents >= 0),
  remaining_balance_cents    integer not null default 0 check (remaining_balance_cents >= 0),
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  policy_id                  text not null,
  policy_accepted_at         timestamptz not null,
  hold_expires_at            timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  check (starts_at < ends_at),
  check (block_starts_at <= starts_at and block_ends_at >= ends_at),

  -- ⚑ The atomic anti-double-booking guarantee: no two ACTIVE appointments
  -- for the same staff member may have overlapping (buffered) time ranges.
  constraint appointments_no_overlap
    exclude using gist (
      staff_id with =,
      tstzrange(block_starts_at, block_ends_at) with &&
    ) where (status in ('pending_payment','confirmed'))
);

create index if not exists idx_appointments_staff_start on appointments (staff_id, starts_at);
create index if not exists idx_appointments_status on appointments (status);
create index if not exists idx_appointments_hold_expiry on appointments (hold_expires_at) where status = 'pending_payment';
create index if not exists idx_staff_availability_staff on staff_availability (staff_id, day_of_week);

drop trigger if exists trg_appointments_updated on appointments;
create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────
alter table services          enable row level security;
alter table staff             enable row level security;
alter table staff_services    enable row level security;
alter table staff_availability enable row level security;
alter table staff_breaks      enable row level security;
alter table staff_time_off    enable row level security;
alter table booking_policies  enable row level security;
alter table appointments      enable row level security;

-- Public may READ safe catalog + availability info only.
create policy "public read active services"  on services         for select using (active = true);
create policy "public read active staff"     on staff            for select using (active = true);
create policy "public read staff_services"   on staff_services   for select using (true);
create policy "public read availability"     on staff_availability for select using (active = true);
create policy "public read breaks"           on staff_breaks     for select using (true);
create policy "public read time off"         on staff_time_off   for select using (true);
create policy "public read active policy"    on booking_policies for select using (active = true);

-- appointments: NO anon/public policies → the anon key can neither read nor
-- write customer appointments. All access goes through the service-role
-- client (server-only), which bypasses RLS. Never expose that key to clients.
