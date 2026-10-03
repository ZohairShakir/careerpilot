# Launch offer operations

Pricing lives in `lib/offer-config.ts`: regular/reference price ₹499, launch ₹149, after launch ₹299, cap 20. The server ignores browser amounts and old promo/Job Fit discount tokens. Existing captured orders at legacy prices remain eligible for downloads.

## Before production deployment

1. Run migrations through `supabase/migrations/006_launch_offer.sql` in the Supabase SQL editor **before** deploying this code. A fresh database needs all migrations in numerical order. Checkout now requires Supabase; failures return 503 rather than create an untracked discounted order.
2. Set server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DOWNLOAD_SIGNING_SECRET`, and `LAUNCH_ENABLED=true`. The key returned to Checkout comes from the server's Razorpay key, avoiding mismatched test/live public keys.
3. Keep Razorpay's signed webhook endpoint `/api/razorpay/webhook` subscribed to `payment.captured`, `order.paid`, and `payment.failed`. Use automatic capture. A webhook must commit the captured purchase before returning 200; persistence failures return 503 for retries. Watch failed webhook deliveries in Razorpay.
4. Keep existing GA4 configuration. Meta Pixel remains `944358658740047`. Clarity needs an actual **Clarity project ID** in `NEXT_PUBLIC_CLARITY_PROJECT_ID`; a Meta Pixel snippet does not activate Clarity.
5. Validate on staging with Razorpay **test** keys before deploying live. This implementation has not migrated the hosted database or deployed the website.

The database serializes reservations and capture handling using a campaign-row lock. An unexpired unpaid launch reservation holds a spot for 15 minutes. Clicks, order creation, client-reported success, and failed payment events do not count as purchases. Failed payment attempts retain their hold until expiry so retries on the same order are possible. Captured reservations count permanently; refunds do not reopen launch spots. Late captured ₹149 payments are honored even if another customer has since used the expired spot.

`GET /api/offer-status` uses database inventory (captures plus unexpired holds), exposes no customer data, and has a 15-second shared-cache limit. The UI polls every 20 seconds and refreshes on focus and after order creation. Counters appear only following a successful API response. API failures hide the counter; order creation remains authoritative. Launch copy, price labels, and the launch FAQ update together. JSON-LD pricing is rendered from server status.

## Resetting tests and ending the offer

- For tests, set `RAZORPAY_KEY_ID=rzp_test_...` and a fresh `LAUNCH_TEST_RUN`, for example `qa-2026-10-03-02`, then restart/redeploy. Each test run has separate inventory; no records need deleting. Complete all credential changes together and use the corresponding test webhook secret.
- Live keys always use `live:launch-v1`. `LAUNCH_TEST_RUN` is ignored for live keys, so changing it cannot reset live inventory. Do not delete or reset live reservations/purchases.
- To end the offer early, set **server-only** `LAUNCH_ENABLED=false` and redeploy. New orders cost ₹299 and launch copy disappears. Previously issued ₹149 orders remain valid and paid purchases are honored. Setting it back to true continues the existing count; it does not reset inventory.

## Delivery and attribution

The thank-you receipt is signed, stores the verified payment amount/tier, and displays the amount actually paid, independently of today's offer. Purchase events use that amount in INR and deduplicate by order ID in browser storage. Razorpay orders and checkout records store `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `price_tier`. Keep campaign tags in your ad destination URLs.

No bundle delivery-email sender or template exists in this repository. An external email workflow must read the captured purchase's `amount` (paise; divide by 100 for rupees), currency, and `price_tier`, rather than use the current offer price. Connecting or updating that workflow requires the email service/template details. The app continues immediate secure download delivery.

## Validation and limits

`npm run build`, `npx tsc --noEmit`, and `node scripts/test-tracking.cjs` validate compilation, tracking amounts, signed receipts, attribution, and per-order Purchase deduplication.

For isolated database tests, install `@electric-sql/pglite` into a temporary directory, set `PGLITE_MODULE` to its module path, then run `node scripts/test-launch-offer.cjs`. It creates a disposable in-memory database, uses the actual SQL migration and transpiled API/payment code, and mocks only gateway responses and Supabase transport. No live credentials or payments are used.

| Acceptance check | Result |
| --- | --- |
| First capture at 14900; 19 spots left | Passed in isolated database |
| Browser amount/promo tampering | Passed; ignored by actual order handler |
| 20 captures; order 21 costs 29900 | Passed in isolated database |
| Competing last-spot requests | One launch, one regular; PGlite serializes SQL, so a real multi-connection PostgreSQL lock stress test remains |
| Abandoned hold expiry | Passed by advancing expiry; spot returns |
| Duplicate signed webhook | Passed; one purchase |
| Kill switch | API charges 29900; rendered disabled state removes launch copy |
| Active ₹499 leftovers | Only the reference-price config remains in active app code; historical migrations retain old values |
| Tracking and paid receipt amounts | Meta/GA queues and receipts passed; Clarity code preserved, activation still needs project ID |
| 375px mobile and desktop | Passed with Playwright; no horizontal overflow or page errors |

Browser plugin was unavailable; local Playwright checked API-driven launch/regular transitions, counter hiding on API failure, modal submission, gateway option amount, UTM preservation, and screenshots. Gateway SDK/network scripts were isolated. A real Razorpay test-mode payment, live SDK event reception, and email delivery still require staging validation.

## Changed files

- Offer config and state: `lib/offer-config.ts`, `lib/launch-offer.ts`, `app/api/offer-status/route.ts`, `app/offer-provider.tsx`, `app/offer-price.tsx`.
- Payment integrity: `supabase/migrations/006_launch_offer.sql`, `lib/razorpay.ts`, `app/api/razorpay/order/route.ts`, `app/api/razorpay/webhook/route.ts`, `app/api/razorpay/verify/route.ts`, `lib/purchase-receipt.ts`.
- UI and policies: `app/layout.tsx`, `app/page.tsx`, `app/purchase-button.tsx`, `app/purchase-modal.tsx`, `app/job-fit-check/job-fit-check.tsx`, `app/thank-you/page.tsx`, `app/thank-you/purchase-success.tsx`, `app/refund-policy/page.tsx`, `app/globals.css`.
- Tracking: `app/analytics.ts`, `app/analytics-provider.tsx`, `app/api/analytics/event/route.ts`.
- Tests and setup: `scripts/test-launch-offer.cjs`, `scripts/test-tracking.cjs`, `.env.example`, `README.md`, this document.
