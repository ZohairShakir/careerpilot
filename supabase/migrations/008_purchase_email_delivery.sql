-- Durable, idempotent fulfilment state for verified purchases. External email
-- calls happen outside these short transactions; Resend also receives a stable
-- idempotency key based on the Razorpay payment id.
create table if not exists public.purchase_deliveries (
  payment_id text primary key references public.purchases(razorpay_payment_id) on delete cascade,
  order_id text not null,
  recipient_email text not null,
  status text not null default 'sending' check (status in ('sending','sent','failed')),
  attempts integer not null default 1 check (attempts > 0),
  provider_message_id text,
  last_error text,
  link_expires_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchase_deliveries_retry_idx
  on public.purchase_deliveries(status, updated_at)
  where status in ('sending','failed');

alter table public.purchase_deliveries enable row level security;
revoke all on public.purchase_deliveries from anon, authenticated;
grant select, insert, update on public.purchase_deliveries to service_role;

create or replace function public.claim_purchase_delivery(
  p_payment_id text,
  p_order_id text,
  p_email text,
  p_link_expires_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare delivery purchase_deliveries; did_claim boolean := false;
begin
  perform 1 from purchases
  where razorpay_payment_id = p_payment_id and razorpay_order_id = p_order_id and status = 'captured';
  if not found then raise exception 'A captured purchase is required before delivery'; end if;

  insert into purchase_deliveries(payment_id,order_id,recipient_email,status,attempts,link_expires_at)
  values(p_payment_id,p_order_id,lower(p_email),'sending',1,p_link_expires_at)
  on conflict(payment_id) do nothing
  returning * into delivery;
  did_claim := found;

  if not did_claim then
    update purchase_deliveries
    set status='sending',attempts=attempts+1,last_error=null,updated_at=now()
    where payment_id=p_payment_id
      and (status='failed' or (status='sending' and updated_at < now() - interval '10 minutes'))
    returning * into delivery;
    did_claim := found;
  end if;

  if delivery.payment_id is null then
    select * into strict delivery from purchase_deliveries where payment_id=p_payment_id;
  end if;

  return jsonb_build_object(
    'claimed',did_claim,
    'status',delivery.status,
    'recipientEmail',delivery.recipient_email,
    'linkExpiresAt',delivery.link_expires_at
  );
end $$;

create or replace function public.complete_purchase_delivery(p_payment_id text, p_provider_message_id text)
returns void language sql security definer set search_path = public as $$
  update purchase_deliveries
  set status='sent',provider_message_id=p_provider_message_id,last_error=null,sent_at=now(),updated_at=now()
  where payment_id=p_payment_id and status='sending';
$$;

create or replace function public.fail_purchase_delivery(p_payment_id text, p_error text)
returns void language sql security definer set search_path = public as $$
  update purchase_deliveries
  set status='failed',last_error=left(p_error,500),updated_at=now()
  where payment_id=p_payment_id and status='sending';
$$;

revoke all on function public.claim_purchase_delivery(text,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.complete_purchase_delivery(text,text) from public,anon,authenticated;
revoke all on function public.fail_purchase_delivery(text,text) from public,anon,authenticated;
grant execute on function public.claim_purchase_delivery(text,text,text,timestamptz) to service_role;
grant execute on function public.complete_purchase_delivery(text,text) to service_role;
grant execute on function public.fail_purchase_delivery(text,text) to service_role;
