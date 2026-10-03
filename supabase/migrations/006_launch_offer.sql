-- Inventory is essential payment state, not best-effort analytics.
create table if not exists public.launch_campaigns (id text primary key);
create table if not exists public.launch_reservations (
  id uuid primary key default gen_random_uuid(),
  campaign text not null references public.launch_campaigns(id),
  amount integer not null check (amount > 0),
  price_tier text not null check (price_tier in ('launch_149','regular_299')),
  name text not null, email text not null, session_id uuid,
  attribution jsonb not null default '{}'::jsonb,
  razorpay_order_id text unique,
  captured_payment_id text unique,
  expires_at timestamptz not null default now() + interval '15 minutes',
  released_at timestamptz,
  created_at timestamptz not null default now()
);
create index launch_reservations_inventory_idx on public.launch_reservations(campaign, price_tier, expires_at);
alter table public.launch_campaigns enable row level security;
alter table public.launch_reservations enable row level security;
revoke all on public.launch_campaigns, public.launch_reservations from anon, authenticated;
grant select, insert, update on public.launch_campaigns, public.launch_reservations to service_role;
alter table public.checkout_attempts drop constraint if exists checkout_attempts_amount_check;
alter table public.checkout_attempts add constraint checkout_attempts_amount_check check (amount > 0);
alter table public.checkout_attempts alter column amount drop default;
alter table public.checkout_attempts add column if not exists price_tier text;
alter table public.checkout_attempts add column if not exists utm_content text;
alter table public.purchases add column if not exists price_tier text;
alter table public.analytics_events add column if not exists utm_content text;
alter table public.visitor_sessions add column if not exists utm_content text;

create or replace function public.launch_offer_status(p_campaign text, p_enabled boolean, p_cap integer, p_launch_amount integer, p_regular_amount integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare taken integer; active boolean;
begin
  select count(*) into taken from launch_reservations
  where campaign = p_campaign and price_tier = 'launch_149'
    and (captured_payment_id is not null or (released_at is null and expires_at > now()));
  active := p_enabled and taken < p_cap;
  return jsonb_build_object('launchActive', active, 'spotsLeft', greatest(0,p_cap-taken), 'currentPrice', (case when active then p_launch_amount else p_regular_amount end) / 100);
end $$;

create or replace function public.reserve_launch_order(p_campaign text, p_enabled boolean, p_cap integer, p_launch_amount integer, p_regular_amount integer, p_name text, p_email text, p_session_id uuid, p_attribution jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare state jsonb; reservation launch_reservations;
begin
  insert into launch_campaigns(id) values(p_campaign) on conflict do nothing;
  -- One lock shared by reservations AND capture processing. Vercel instances cannot oversell the last unexpired spot.
  perform 1 from launch_campaigns where id = p_campaign for update;
  state := launch_offer_status(p_campaign,p_enabled,p_cap,p_launch_amount,p_regular_amount);
  insert into launch_reservations(campaign,amount,price_tier,name,email,session_id,attribution)
  values(p_campaign,(state->>'currentPrice')::integer*100,
    case when (state->>'launchActive')::boolean then 'launch_149' else 'regular_299' end,
    p_name,p_email,p_session_id,p_attribution)
  returning * into reservation;
  return to_jsonb(reservation);
end $$;

create or replace function public.bind_launch_order(p_reservation_id uuid, p_order_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare reservation launch_reservations;
begin
  select * into strict reservation from launch_reservations where id = p_reservation_id for update;
  if reservation.razorpay_order_id is not null and reservation.razorpay_order_id <> p_order_id then raise exception 'Reservation already bound'; end if;
  update launch_reservations set razorpay_order_id=p_order_id where id=p_reservation_id;
  if reservation.session_id is not null then
    insert into visitor_sessions(session_id,utm_source,utm_medium,utm_campaign,utm_content)
    values(reservation.session_id,reservation.attribution->>'source',reservation.attribution->>'medium',reservation.attribution->>'campaign',reservation.attribution->>'content')
    on conflict(session_id) do nothing;
  end if;
  insert into checkout_attempts(name,email,session_id,razorpay_order_id,amount,currency,price_tier,utm_source,utm_medium,utm_campaign,utm_content)
  values(reservation.name,reservation.email,reservation.session_id,p_order_id,reservation.amount,'INR',reservation.price_tier,
    reservation.attribution->>'source',reservation.attribution->>'medium',reservation.attribution->>'campaign',reservation.attribution->>'content')
  on conflict(razorpay_order_id) do nothing;
  return jsonb_build_object('bound',true);
end $$;

create or replace function public.record_launch_capture(p_reservation_id uuid, p_order_id text, p_payment_id text, p_amount integer, p_email text, p_event_id text, p_event_type text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare reservation launch_reservations; attempt checkout_attempts; tier text := 'legacy';
begin
  if p_reservation_id is not null then
    select * into strict reservation from launch_reservations where id=p_reservation_id;
    perform 1 from launch_campaigns where id=reservation.campaign for update;
    select * into strict reservation from launch_reservations where id=p_reservation_id for update;
    if reservation.amount <> p_amount or (reservation.razorpay_order_id is not null and reservation.razorpay_order_id <> p_order_id) then
      raise exception 'Captured payment does not match reservation';
    end if;
    if reservation.captured_payment_id is not null and reservation.captured_payment_id <> p_payment_id then raise exception 'Order already captured by another payment'; end if;
    -- Expired or overflow reservations are still honored if paid. No cap-based refusal of a captured payment.
    update launch_reservations set captured_payment_id=p_payment_id,razorpay_order_id=p_order_id where id=p_reservation_id;
    perform bind_launch_order(p_reservation_id,p_order_id);
    tier := reservation.price_tier;
  end if;
  select * into attempt from checkout_attempts where razorpay_order_id=p_order_id;
  insert into purchases(checkout_attempt_id,session_id,razorpay_order_id,razorpay_payment_id,email,amount,currency,status,price_tier)
  values(attempt.id,attempt.session_id,p_order_id,p_payment_id,coalesce(attempt.email,p_email),p_amount,'INR','captured',tier)
  on conflict(razorpay_payment_id) do nothing;
  update checkout_attempts set status='captured',price_tier=tier,updated_at=now() where razorpay_order_id=p_order_id;
  insert into webhook_events(event_id,event_type,payload) values(p_event_id,p_event_type,p_payload) on conflict do nothing;
  return jsonb_build_object('recorded',true);
end $$;

revoke all on function public.launch_offer_status(text,boolean,integer,integer,integer) from public,anon,authenticated;
revoke all on function public.reserve_launch_order(text,boolean,integer,integer,integer,text,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.bind_launch_order(uuid,text) from public,anon,authenticated;
revoke all on function public.record_launch_capture(uuid,text,text,integer,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.launch_offer_status(text,boolean,integer,integer,integer) to service_role;
grant execute on function public.reserve_launch_order(text,boolean,integer,integer,integer,text,text,uuid,jsonb) to service_role;
grant execute on function public.bind_launch_order(uuid,text) to service_role;
grant execute on function public.record_launch_capture(uuid,text,text,integer,text,text,text,jsonb) to service_role;
