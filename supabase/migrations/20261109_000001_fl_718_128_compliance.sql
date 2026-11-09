-- Florida Statute 718.128 compliance foundation
-- This migration separates voter identity from ballot choice storage and records
-- consent and receipt data needed for recount, inspection, and auditability.

create extension if not exists pgcrypto;

create table if not exists election_voter_consents (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  user_id uuid not null,
  consent_channel text not null default 'electronic',
  consent_status text not null default 'granted',
  consented_at timestamptz not null default now(),
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, user_id)
);

create index if not exists election_voter_consents_election_idx
  on election_voter_consents (election_id);

create index if not exists election_voter_consents_user_idx
  on election_voter_consents (user_id);

create table if not exists vote_casts (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  ballot_id uuid not null,
  option_id uuid not null,
  voter_hash text not null,
  choice_hash text not null,
  receipt_token text not null unique,
  vote_payload jsonb not null,
  submitted_at timestamptz not null default now(),
  device_check_passed boolean not null default false,
  unique (election_id, ballot_id, voter_hash)
);

create index if not exists vote_casts_election_idx
  on vote_casts (election_id, submitted_at);

create index if not exists vote_casts_ballot_idx
  on vote_casts (ballot_id, submitted_at);

create table if not exists vote_receipts (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  ballot_id uuid not null,
  option_id uuid not null,
  voter_hash text not null,
  receipt_token text not null unique,
  receipt_message text not null,
  created_at timestamptz not null default now()
);

create index if not exists vote_receipts_election_idx
  on vote_receipts (election_id, created_at);

create table if not exists election_notice_records (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  notice_type text not null,
  notice_channel text not null default 'email',
  notice_sent_at timestamptz not null default now(),
  notice_payload jsonb not null default '{}'::jsonb,
  unique (election_id, notice_type)
);

create index if not exists election_notice_records_election_idx
  on election_notice_records (election_id, notice_sent_at);

alter table election_voter_consents
  enable row level security;

alter table vote_casts
  enable row level security;

alter table vote_receipts
  enable row level security;

alter table election_notice_records
  enable row level security;

create policy if not exists election_voter_consents_select_own
  on election_voter_consents
  for select
  using (auth.uid() = user_id);

create policy if not exists election_voter_consents_insert_own
  on election_voter_consents
  for insert
  with check (auth.uid() = user_id);

create policy if not exists vote_casts_select_admin
  on vote_casts
  for select
  using (true);

create policy if not exists vote_receipts_select_admin
  on vote_receipts
  for select
  using (true);

create policy if not exists election_notice_records_select_admin
  on election_notice_records
  for select
  using (true);
