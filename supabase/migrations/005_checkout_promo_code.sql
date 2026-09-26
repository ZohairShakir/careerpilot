alter table public.checkout_attempts
  drop constraint if exists checkout_attempts_amount_check;

alter table public.checkout_attempts
  add constraint checkout_attempts_amount_check
  check (amount in (49900, 39900, 29900));

alter table public.checkout_attempts
  add column if not exists promo_code text;

alter table public.checkout_attempts
  drop constraint if exists checkout_attempts_promo_code_check;

alter table public.checkout_attempts
  add constraint checkout_attempts_promo_code_check
  check (promo_code is null or promo_code = 'FB299');

create index if not exists checkout_attempts_promo_code_created_idx
  on public.checkout_attempts(promo_code, created_at desc)
  where promo_code is not null;
