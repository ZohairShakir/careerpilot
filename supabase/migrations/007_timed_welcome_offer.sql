-- A signed, per-browser welcome window can select ₹100. The database still
-- serializes every order and stores the server-selected tier and amount.
alter table public.launch_reservations drop constraint if exists launch_reservations_price_tier_check;
alter table public.launch_reservations
  add constraint launch_reservations_price_tier_check
  check (price_tier in ('flash_100','launch_149','regular_299'));

create or replace function public.reserve_timed_offer_order(
  p_campaign text,
  p_enabled boolean,
  p_cap integer,
  p_launch_amount integer,
  p_regular_amount integer,
  p_flash_active boolean,
  p_flash_amount integer,
  p_name text,
  p_email text,
  p_session_id uuid,
  p_attribution jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare state jsonb; reservation launch_reservations; selected_amount integer; selected_tier text;
begin
  insert into launch_campaigns(id) values(p_campaign) on conflict do nothing;
  -- The campaign lock keeps launch inventory and timed-offer reservations in
  -- the same authoritative order ledger across concurrent Vercel instances.
  perform 1 from launch_campaigns where id = p_campaign for update;
  state := launch_offer_status(p_campaign,p_enabled,p_cap,p_launch_amount,p_regular_amount);
  if p_flash_active then
    selected_amount := p_flash_amount;
    selected_tier := 'flash_100';
  else
    selected_amount := (state->>'currentPrice')::integer * 100;
    selected_tier := case when (state->>'launchActive')::boolean then 'launch_149' else 'regular_299' end;
  end if;
  if selected_amount <= 0 then raise exception 'Invalid offer amount'; end if;
  insert into launch_reservations(campaign,amount,price_tier,name,email,session_id,attribution)
  values(p_campaign,selected_amount,selected_tier,p_name,p_email,p_session_id,p_attribution)
  returning * into reservation;
  return to_jsonb(reservation);
end $$;

revoke all on function public.reserve_timed_offer_order(text,boolean,integer,integer,integer,boolean,integer,text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_timed_offer_order(text,boolean,integer,integer,integer,boolean,integer,text,text,uuid,jsonb) to service_role;
