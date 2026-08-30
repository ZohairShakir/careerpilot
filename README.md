# Career Pilot landing page

Premium landing page and Razorpay checkout flow for the Career Pilot AI Job Search Bundle.

## Local development

1. Copy `.env.example` to `.env.local` and add Razorpay Test Mode credentials.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The payment flow creates a Razorpay order on the server, verifies the checkout signature, confirms the payment is captured, and then issues short-lived signed download links. The paid PDFs stay in `products/` and are never exposed through `public/`.

## Analytics and attribution

1. Create a Supabase project and run `supabase/migrations/001_analytics.sql` in its SQL editor.
2. Add `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
3. Create a GA4 web property and add its measurement ID as `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Configure the Razorpay webhook URL as `https://careerpilot.store/api/razorpay/webhook` and subscribe to `payment.captured`, `payment.failed`, and `order.paid`.

The first-party event stream records anonymous sessions, UTM attribution, checkout progression, payment status, and downloads. Supabase views `funnel_summary` and `abandoned_checkouts` provide the initial reporting layer.

Set `ANALYTICS_DASHBOARD_USER` and `ANALYTICS_DASHBOARD_PASSWORD` to protect the reporting page at `/admin/analytics` with HTTP Basic authentication.
