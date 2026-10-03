// Uses an isolated PostgreSQL WASM database; never connects to Supabase or Razorpay.
// npm install --prefix <temporary-directory> @electric-sql/pglite
// PGLITE_MODULE=<temporary-directory>/node_modules/@electric-sql/pglite node scripts/test-launch-offer.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const { PGlite } = require(process.env.PGLITE_MODULE || path.join(os.tmpdir(), 'careerpilot-launch-test-deps/node_modules/@electric-sql/pglite'));
const env = { RAZORPAY_KEY_ID: 'rzp_test_local', RAZORPAY_KEY_SECRET: 'test-secret', RAZORPAY_WEBHOOK_SECRET: 'webhook-secret', LAUNCH_ENABLED: 'true', LAUNCH_TEST_RUN: 'acceptance' };
const modules = new Map(), orders = new Map(), payments = new Map();
let db, unavailable = false, serial = 0;
async function rpc(name, args) {
  const entries = Object.entries(args);
  const query = `select public.${name}(${entries.map(([key], i) => `${key} => $${i + 1}`).join(',')}) as result`;
  const values = entries.map(([, value]) => value && typeof value === 'object' ? JSON.stringify(value) : value);
  return (await db.query(query, values)).rows[0].result;
}
async function supabaseRequest(url, init = {}) {
  if (unavailable) throw Error('Simulated database outage');
  if (url.startsWith('rpc/')) return rpc(url.slice(4), JSON.parse(init.body));
  if (url.startsWith('launch_reservations?')) {
    const id = new URLSearchParams(url.split('?')[1]).get('id').slice(3);
    await db.query('update launch_reservations set released_at=now() where id=$1 and captured_payment_id is null', [id]);
    return null;
  }
  return null;
}
async function gateway(url, init) {
  const endpoint = url.replace('https://api.razorpay.com/v1/', '');
  if (endpoint === 'orders') {
    const order = { ...JSON.parse(init.body), id: `order_${++serial}` };
    orders.set(order.id, order);
    return Response.json(order);
  }
  return Response.json(endpoint.startsWith('payments/') ? payments.get(endpoint.slice(9)) : orders.get(endpoint.slice(7)));
}
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  modules.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Buffer, console, fetch: gateway, process: { env }, Request, Response,
    require: name => name === 'react' ? { cache: fn => fn } : name.endsWith('/supabase') || name === './supabase' ? { supabaseRequest } : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name),
  }, { filename: file });
  return exports;
}
const request = body => new Request('http://localhost/api/razorpay/order', { method: 'POST', body: JSON.stringify({ name: 'Test Buyer', email: 'test@example.com', ...body }) });
async function main() {
  db = new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role;');
  for (const migration of ['001_analytics.sql', '005_checkout_promo_code.sql', '006_launch_offer.sql']) {
    await db.exec(fs.readFileSync(`supabase/migrations/${migration}`, 'utf8').replace('create extension if not exists pgcrypto;', ''));
  }
  const orderRoute = load('app/api/razorpay/order/route.ts');
  const webhook = load('app/api/razorpay/webhook/route.ts');
  const offer = load('lib/launch-offer.ts');
  const statusRoute = load('app/api/offer-status/route.ts');
  const config = load('lib/offer-config.ts');
  const razorpay = load('lib/razorpay.ts');
  async function order(body = {}) { const res = await orderRoute.POST(request(body)); assert.equal(res.status, 200); return res.json(); }
  async function capture(order, eventId = `event_${order.orderId}`, signature = true) {
    const payId = `pay_${order.orderId}`;
    payments.set(payId, { status: 'captured', amount: order.amount, currency: 'INR', order_id: order.orderId, email: 'test@example.com' });
    const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: payId, order_id: order.orderId } } } });
    return webhook.POST(new Request('http://localhost/webhook', { method: 'POST', body: raw, headers: {
      'x-razorpay-event-id': eventId, 'x-razorpay-signature': signature ? crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex') : 'bad',
    } }));
  }
  const first = await order({ amount: 100, price: 1, promoCode: 'FB299', attribution: { source: 'instagram', medium: 'paid', campaign: 'launch', content: 'creative_01' } });
  assert.equal(first.amount, 14900);
  assert.equal(first.priceTier, 'launch_149');
  assert.equal((await offer.getOfferStatus()).spotsLeft, 19);
  assert.equal((await db.query('select count(*)::int as n from purchases')).rows[0].n, 0, 'created orders are not purchases');
  assert.equal((await capture(first, 'invalid', false)).status, 400);
  assert.equal((await capture(first)).status, 200);
  assert.equal((await capture(first)).status, 200);
  assert.equal((await capture(first, 'another_delivery')).status, 200);
  assert.equal((await db.query('select count(*)::int as n from purchases')).rows[0].n, 1);
  const stored = (await db.query('select * from checkout_attempts where razorpay_order_id=$1', [first.orderId])).rows[0];
  assert.equal(stored.utm_content, 'creative_01'); assert.equal(stored.price_tier, 'launch_149');
  assert.equal(orders.get(first.orderId).notes.utm_content, 'creative_01');
  for (let i = 1; i < 19; i++) { const next = await order(); assert.equal(next.amount, 14900); assert.equal((await capture(next)).status, 200); }
  // PGlite queues statements: this checks competing requests but is not a multi-connection lock stress test.
  const lastRequests = await Promise.all([order(), order()]);
  assert.deepEqual(lastRequests.map(item => item.amount).sort(), [14900, 29900]);
  const twentieth = lastRequests.find(item => item.amount === 14900);
  assert.equal((await capture(twentieth)).status, 200);
  assert.equal((await order()).amount, 29900);
  assert.equal((await offer.getOfferStatus()).launchActive, false);
  assert.equal((await offer.getOfferStatus()).spotsLeft, 0);
  env.LAUNCH_TEST_RUN = 'expiry';
  const abandoned = await order();
  const abandonedId = orders.get(abandoned.orderId).notes.reservation_id;
  assert.equal((await offer.getOfferStatus()).spotsLeft, 19);
  await db.query("update launch_reservations set expires_at=now()-interval '1 second' where id=$1", [abandonedId]);
  assert.equal((await offer.getOfferStatus()).spotsLeft, 20);
  for (let i = 0; i < 20; i++) assert.equal((await capture(await order())).status, 200);
  assert.equal((await capture(abandoned)).status, 200, 'late paid launch orders are honored even above cap');
  assert.equal((await offer.getOfferStatus()).spotsLeft, 0);
  env.LAUNCH_ENABLED = 'false'; env.LAUNCH_TEST_RUN = 'disabled';
  assert.equal((await order({ amount: 14900 })).amount, 29900);
  assert.equal((await offer.getOfferStatus()).launchActive, false);
  const response = await statusRoute.GET();
  assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /s-maxage=15/);
  assert.equal((await response.json()).regularPrice, 499);
  env.RAZORPAY_KEY_ID = 'rzp_live_local'; assert.equal(config.offerCampaign(), 'live:launch-v1');
  env.LAUNCH_TEST_RUN = 'different'; assert.equal(config.offerCampaign(), 'live:launch-v1', 'test resets cannot reset live inventory');
  env.RAZORPAY_KEY_ID = 'rzp_test_local';
  assert.equal(await razorpay.capturedPayment(`pay_${first.orderId}`, 'unrelated_order'), null);
  unavailable = true;
  assert.equal((await statusRoute.GET()).status, 503);
  assert.equal((await orderRoute.POST(request({}))).status, 503);
  assert.equal((await capture(first)).status, 503, 'webhook is not acknowledged on persistence failure');
  await db.close();
  console.log('PASS: server pricing/tamper protection, 20 paid orders, last spot allocation, expiry, webhook signatures/deduplication/retry, late paid overflow, kill switch, UTM/tier storage, API caching, live/test isolation.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
