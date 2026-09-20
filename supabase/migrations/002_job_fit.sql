alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (
  event_name in (
    'page_view','bundle_cta_clicked','checkout_opened','checkout_details_submitted',
    'razorpay_opened','checkout_dismissed','payment_failed','payment_captured','bundle_downloaded',
    'job_fit_viewed','job_fit_started','resume_uploaded','job_fit_completed','job_fit_failed','job_fit_bundle_cta_clicked'
  )
);

create table if not exists public.job_fit_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(session_id) on delete set null,
  visitor_fingerprint text not null,
  resume_method text not null check (resume_method in ('paste','pdf','docx','txt','file')),
  resume_chars integer not null check (resume_chars > 0),
  job_description_chars integer not null check (job_description_chars > 0),
  status text not null default 'started' check (status in ('started','completed','failed')),
  alignment text check (alignment in ('strong_alignment','possible_alignment','significant_gaps')),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists job_fit_runs_fingerprint_created_idx on public.job_fit_runs(visitor_fingerprint, created_at desc);
create index if not exists job_fit_runs_status_created_idx on public.job_fit_runs(status, created_at desc);
create index if not exists job_fit_runs_session_created_idx on public.job_fit_runs(session_id, created_at desc) where session_id is not null;

alter table public.job_fit_runs enable row level security;

create or replace function public.start_job_fit_run(
  p_session_id uuid,
  p_fingerprint text,
  p_resume_method text,
  p_resume_chars integer,
  p_job_description_chars integer
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_fingerprint));
  if (select count(*) from public.job_fit_runs where visitor_fingerprint = p_fingerprint and created_at >= now() - interval '24 hours') >= 3 then
    return null;
  end if;
  insert into public.job_fit_runs(session_id, visitor_fingerprint, resume_method, resume_chars, job_description_chars)
  values (p_session_id, p_fingerprint, p_resume_method, p_resume_chars, p_job_description_chars)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.start_job_fit_run(uuid,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.start_job_fit_run(uuid,text,text,integer,integer) to service_role;
