-- Florida Statute 718.128 electronic-voting foundation.
--
-- This is a starting point, not a legal-compliance certification. Voter
-- participation (identity + ballot scope) is stored separately from cast
-- choices; no voter id, receipt token, or participation-row id is written to
-- vote_casts. Production review should consider database operators, backups,
-- logs, timing correlation, key management, and the applicable association rules.

create extension if not exists pgcrypto;

create table if not exists public.election_voter_consents (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  user_id uuid not null,
  consent_channel text not null default 'electronic'
    check (consent_channel in ('electronic', 'written')),
  consent_status text not null default 'granted'
    check (consent_status in ('granted', 'opted_out')),
  consented_at timestamptz not null default now(),
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, user_id),
  check (
    (consent_status = 'granted' and opted_out_at is null)
    or (consent_status = 'opted_out' and opted_out_at is not null)
  )
);

create table if not exists public.election_voter_participation (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  ballot_id uuid not null,
  user_id uuid not null,
  receipt_token uuid not null unique default gen_random_uuid(),
  -- Deliberately no vote id, option id, or cast timestamp here.
  unique (election_id, ballot_id, user_id)
);

create index if not exists election_voter_participation_user_idx
  on public.election_voter_participation (user_id, election_id);

create table if not exists public.vote_casts (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  ballot_id uuid not null,
  option_id uuid not null,
  cast_at timestamptz not null default now()
);

create index if not exists vote_casts_election_ballot_idx
  on public.vote_casts (election_id, ballot_id);

create table if not exists public.election_notice_records (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null,
  notice_type text not null,
  notice_channel text not null,
  notice_sent_at timestamptz not null,
  notice_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (election_id, notice_type, notice_channel)
);

alter table public.election_voter_consents enable row level security;
alter table public.election_voter_participation enable row level security;
alter table public.vote_casts enable row level security;
alter table public.election_notice_records enable row level security;

-- Do not expose identifying or cast records directly through PostgREST.
revoke all on table public.election_voter_consents from anon, authenticated;
revoke all on table public.election_voter_participation from anon, authenticated;
revoke all on table public.vote_casts from anon, authenticated;
revoke all on table public.election_notice_records from anon, authenticated;

create or replace function public.set_election_voting_consent(
  p_election_id uuid,
  p_consented boolean
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not exists (
    select 1 from public.elections e
    where e.id = p_election_id
  ) then
    raise exception 'Election not found' using errcode = '22023';
  end if;

  insert into public.election_voter_consents (
    election_id, user_id, consent_channel, consent_status,
    consented_at, opted_out_at, updated_at
  ) values (
    p_election_id, v_user_id, 'electronic',
    case when p_consented then 'granted' else 'opted_out' end,
    now(), case when p_consented then null else now() end, now()
  )
  on conflict (election_id, user_id) do update set
    consent_channel = 'electronic',
    consent_status = excluded.consent_status,
    consented_at = case when p_consented then now()
      else public.election_voter_consents.consented_at end,
    opted_out_at = case when p_consented then null else now() end,
    updated_at = now();
end;
$$;

create or replace function public.cast_election_vote(
  p_election_id uuid,
  p_ballot_id uuid,
  p_option_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_receipt_token uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not exists (
    select 1 from public.elections e
    where e.id = p_election_id and e.status = 'published'
  ) then
    raise exception 'Election is not active' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.ballots b
    where b.id = p_ballot_id and b.election_id = p_election_id
  ) then
    raise exception 'Invalid ballot' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.ballot_options o
    where o.id = p_option_id and o.ballot_id = p_ballot_id
  ) then
    raise exception 'Invalid ballot option' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.election_voter_consents c
    where c.election_id = p_election_id
      and c.user_id = v_user_id
      and c.consent_status = 'granted'
      and c.opted_out_at is null
  ) then
    raise exception 'Electronic voting consent is required' using errcode = '42501';
  end if;

  -- A unique participation row prevents repeat voting on this ballot. The
  -- choice row has no identity or receipt reference. Both writes are atomic.
  insert into public.election_voter_participation (
    election_id, ballot_id, user_id
  ) values (
    p_election_id, p_ballot_id, v_user_id
  ) returning receipt_token into v_receipt_token;

  insert into public.vote_casts (election_id, ballot_id, option_id)
  values (p_election_id, p_ballot_id, p_option_id);

  return v_receipt_token;
exception
  when unique_violation then
    raise exception 'A vote has already been recorded for this ballot' using errcode = '23505';
end;
$$;

revoke all on function public.set_election_voting_consent(uuid, boolean) from public, anon;
revoke all on function public.cast_election_vote(uuid, uuid, uuid) from public, anon;
grant execute on function public.set_election_voting_consent(uuid, boolean) to authenticated;
grant execute on function public.cast_election_vote(uuid, uuid, uuid) to authenticated;
