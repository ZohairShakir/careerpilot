alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (
  event_name in (
    'page_view','bundle_cta_clicked','checkout_opened','checkout_details_submitted',
    'razorpay_opened','checkout_dismissed','payment_failed','payment_captured','bundle_downloaded',
    'job_fit_viewed','job_fit_started','resume_uploaded','job_fit_completed','job_fit_failed','job_fit_bundle_cta_clicked',
    'role_title_analysis_used','job_description_analysis_used','result_viewed','paid_offer_viewed','discount_clicked','checkout_clicked'
  )
);

alter table public.checkout_attempts drop constraint if exists checkout_attempts_amount_check;
alter table public.checkout_attempts add constraint checkout_attempts_amount_check check (amount in (49900, 39900));
