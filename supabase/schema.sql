-- ============================================================
-- OneBeleza QrCode — Supabase Schema
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Habilita extensão para UUID
create extension if not exists "pgcrypto";

-- ========================
-- Tabelas
-- ========================

create table if not exists folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists qr_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  folder_id   uuid references folders(id) on delete set null,
  slug        text not null unique,
  type        text not null check (type in ('base', 'exclusive')),
  name        text not null,
  scan_count  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists welcome_screens (
  id                  uuid primary key default gen_random_uuid(),
  qr_code_id          uuid not null unique references qr_codes(id) on delete cascade,
  app_name            text,
  developer           text,
  logo_url            text,
  title               text,
  description         text,
  website             text,
  color_primary       text not null default '#1a1a1a',
  color_secondary     text not null default '#ffffff',
  welcome_image_url   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists app_store_links (
  id          uuid primary key default gen_random_uuid(),
  qr_code_id  uuid not null references qr_codes(id) on delete cascade,
  platform    text not null check (platform in ('ios', 'android', 'amazon')),
  url         text not null,
  unique (qr_code_id, platform)
);

create table if not exists custom_buttons (
  id          uuid primary key default gen_random_uuid(),
  qr_code_id  uuid not null references qr_codes(id) on delete cascade,
  label       text not null,
  url         text not null,
  "order"     integer not null default 0
);

create table if not exists scans (
  id          uuid primary key default gen_random_uuid(),
  qr_code_id  uuid not null references qr_codes(id) on delete cascade,
  scanned_at  timestamptz not null default now(),
  user_agent  text,
  country     text
);

-- ========================
-- Indexes
-- ========================

create index if not exists idx_qr_codes_user_id on qr_codes (user_id);
create index if not exists idx_qr_codes_slug on qr_codes (slug);
create index if not exists idx_qr_codes_is_active on qr_codes (is_active);
create index if not exists idx_scans_qr_code_id on scans (qr_code_id);
create index if not exists idx_scans_scanned_at on scans (scanned_at);

-- ========================
-- Trigger: updated_at
-- ========================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists qr_codes_updated_at on qr_codes;
create trigger qr_codes_updated_at
  before update on qr_codes
  for each row execute function update_updated_at();

drop trigger if exists welcome_screens_updated_at on welcome_screens;
create trigger welcome_screens_updated_at
  before update on welcome_screens
  for each row execute function update_updated_at();

-- ========================
-- Function: increment scan count
-- ========================

create or replace function increment_scan_count(qr_code_id_input uuid)
returns void language plpgsql security definer as $$
begin
  update qr_codes
  set scan_count = scan_count + 1
  where id = qr_code_id_input;
end;
$$;

-- ========================
-- Row Level Security
-- ========================

alter table folders enable row level security;
alter table qr_codes enable row level security;
alter table welcome_screens enable row level security;
alter table app_store_links enable row level security;
alter table custom_buttons enable row level security;
alter table scans enable row level security;

-- Folders: apenas o dono vê/altera
drop policy if exists "folders_owner" on folders;
create policy "folders_owner" on folders
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- QR Codes: apenas o dono vê/altera
drop policy if exists "qrcodes_owner" on qr_codes;
create policy "qrcodes_owner" on qr_codes
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Welcome screens: owner via qr_code
drop policy if exists "welcome_screens_owner" on welcome_screens;
create policy "welcome_screens_owner" on welcome_screens
  using (
    qr_code_id in (select id from qr_codes where user_id = auth.uid())
  );

-- App store links: owner via qr_code
drop policy if exists "app_store_links_owner" on app_store_links;
create policy "app_store_links_owner" on app_store_links
  using (
    qr_code_id in (select id from qr_codes where user_id = auth.uid())
  );

-- Custom buttons: owner via qr_code
drop policy if exists "custom_buttons_owner" on custom_buttons;
create policy "custom_buttons_owner" on custom_buttons
  using (
    qr_code_id in (select id from qr_codes where user_id = auth.uid())
  );

-- Scans: service role only (via API backend)
drop policy if exists "scans_service" on scans;
create policy "scans_service" on scans
  using (false);  -- API usa service_role, que ignora RLS

-- ========================
-- Storage bucket
-- ========================

-- Execute no painel Storage do Supabase:
-- 1. Crie o bucket "qrcode-assets" com acesso público
-- 2. Ou use o SQL abaixo (requer service_role):

-- insert into storage.buckets (id, name, public)
-- values ('qrcode-assets', 'qrcode-assets', true);
