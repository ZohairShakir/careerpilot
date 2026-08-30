create extension if not exists pgcrypto;

create table if not exists public.visitor_sessions (
  session_id uuid primary key,
  first_referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.visitor_sessions(session_id) on delete cascade,
  event_name text not null check (event_name in ('page_view','bundle_cta_clicked','checkout_opened','checkout_details_submitted','razorpay_opened','checkout_dismissed','payment_failed','payment_captured','bundle_downloaded')),
  page_path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_session_created_idx on public.analytics_events(session_id, created_at desc);
create index if not exists analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);
create index if not exists analytics_events_campaign_idx on public.analytics_events(utm_campaign) where utm_campaign is not null and utm_campaign <> '';

create table if not exists public.checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(session_id) on delete set null,
  name text not null,
  email text not null,
  razorpay_order_id text not null unique,
  amount integer not null default 49900 check (amount = 49900),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created','razorpay_opened','abandoned','failed','captured','refunded')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkout_attempts_status_updated_idx on public.checkout_attempts(status, updated_at desc);
create index if not exists checkout_attempts_email_created_idx on public.checkout_attempts(lower(email), created_at desc);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  checkout_attempt_id uuid references public.checkout_attempts(id) on delete set null,
  session_id uuid references public.visitor_sessions(session_id) on delete set null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text not null unique,
  email text,
  amount integer not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'captured' check (status in ('captured','refunded','disputed')),
  download_count integer not null default 0 check (download_count >= 0),
  last_downloaded_at timestamptz,
  purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_purchased_at_idx on public.purchases(purchased_at desc);
create index if not exists purchases_email_idx on public.purchases(lower(email)) where email is not null;

create table if not exists public.webhook_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

alter table public.visitor_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.checkout_attempts enable row level security;
alter table public.purchases enable row level security;
alter table public.webhook_events enable row level security;

create or replace function public.record_bundle_download(payment_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.purchases
  set download_count = download_count + 1,
      last_downloaded_at = now(),
      updated_at = now()
  where razorpay_payment_id = payment_id;
$$;

revoke all on function public.record_bundle_download(text) from public, anon, authenticated;
grant execute on function public.record_bundle_download(text) to service_role;

create or replace view public.abandoned_checkouts as
select id, name, email, razorpay_order_id, status, utm_source, utm_medium, utm_campaign, created_at, updated_at
from public.checkout_attempts
where status in ('created','razorpay_opened','abandoned','failed')
  and updated_at < now() - interval '1 hour';

create or replace view public.funnel_summary as
select
  count(distinct session_id) filter (where event_name = 'page_view') as visitors,
  count(*) filter (where event_name = 'bundle_cta_clicked') as cta_clicks,
  count(*) filter (where event_name = 'checkout_opened') as checkout_opens,
  count(*) filter (where event_name = 'checkout_details_submitted') as checkout_starts,
  count(*) filter (where event_name = 'payment_captured') as purchases,
  round(100.0 * count(*) filter (where event_name = 'payment_captured') / nullif(count(distinct session_id) filter (where event_name = 'page_view'), 0), 2) as conversion_rate
from public.analytics_events;
