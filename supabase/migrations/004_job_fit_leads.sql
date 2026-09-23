alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (
  event_name in (
    'page_view','bundle_cta_clicked','checkout_opened','checkout_details_submitted',
    'razorpay_opened','checkout_dismissed','payment_failed','payment_captured','bundle_downloaded',
    'job_fit_viewed','job_fit_started','resume_uploaded','job_fit_completed','job_fit_failed','job_fit_bundle_cta_clicked',
    'role_title_analysis_used','job_description_analysis_used','result_viewed','paid_offer_viewed','discount_clicked','checkout_clicked',
    'lead_modal_viewed','job_fit_lead_submitted','marketing_consent_given','lead_modal_abandoned','result_revealed',
    'offer_viewed_after_lead','offer_clicked_after_lead','lead_to_purchase'
  )
);

create table if not exists public.job_fit_leads (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique,
  session_id uuid references public.visitor_sessions(session_id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 160),
  input_mode text not null check (input_mode in ('job_description','role_title')),
  role_title text,
  analysis_status text not null default 'started' check (analysis_status in ('started','completed','failed')),
  alignment text check (alignment in ('strong_alignment','possible_alignment','significant_gaps')),
  marketing_consent boolean not null default false,
  consented_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_fit_leads_email_created_idx on public.job_fit_leads(lower(email), created_at desc);
create index if not exists job_fit_leads_session_created_idx on public.job_fit_leads(session_id, created_at desc) where session_id is not null;
create index if not exists job_fit_leads_status_created_idx on public.job_fit_leads(analysis_status, created_at desc);

alter table public.job_fit_leads enable row level security;
