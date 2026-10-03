const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, context = {}, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => dependencies[name] ?? require(name), ...context });
  return exports;
}

const storage = new Map();
const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const location = { pathname: '/', search: '', href: 'https://careerpilot.store/' };
const gaEvents = [];
const window = { gtag: (...args) => gaEvents.push(args) };
const context = { window, location, localStorage, crypto: require('node:crypto').webcrypto, URLSearchParams, document: { referrer: '', title: 'Bundle' }, navigator: { sendBeacon: () => true } };
const { pixel } = load('app/meta-pixel.tsx', context, { 'next/navigation': {}, 'next/script': {} });
const { track, analyticsContext } = load('app/analytics.ts', context, { './meta-pixel': { pixel }, '../lib/offer-config': load('lib/offer-config.ts', { process }) });
track('page_view', { value: 149, price_tier: 'launch_149' });
assert.equal(window.fbq.queue[0][2], false, 'manual mode must precede initialization');
track('bundle_cta_clicked', { value: 149, price_tier: 'launch_149' });
track('razorpay_opened', { value: 299 });
track('payment_captured', { value: 299, paymentId: 'pay_test' });
assert.deepEqual(JSON.parse(JSON.stringify(window.fbq.queue.map(args => args[1]))), ['autoConfig', '944358658740047', 'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase']);
assert.equal(window.fbq.queue[3][2].value, 149);
assert.equal(window.fbq.queue[4][2].value, 149);
assert.equal(window.fbq.queue[5][2].value, 299);
assert.equal(gaEvents.find(args => args[1] === 'purchase')[2].value, 299);
assert.equal(gaEvents.find(args => args[1] === 'purchase')[2].currency, 'INR');
assert.equal(window.fbq.queue[6][2].currency, 'INR');
assert.equal(window.fbq.queue[6][3].eventID, 'pay_test');
location.search = '?utm_source=instagram&utm_medium=paid&utm_campaign=dont_apply_test';
assert.equal(analyticsContext().attribution.source, 'instagram');
location.search = ''; location.pathname = '/thank-you';
assert.equal(analyticsContext().attribution.campaign, 'dont_apply_test');
location.pathname = '/admin/analytics';
pixel('PageView');
assert.equal(window.fbq.queue.length, 7);

let purchases = 0;
const Success = load('app/thank-you/purchase-success.tsx', { localStorage }, {
  react: { useEffect: callback => callback() }, '../analytics': { track: () => purchases++ },
}).default;
const props = { paymentId: 'pay_refresh', orderId: 'order_test', value: 299, priceTier: 'regular_299', downloads: [{ url: '/download', label: 'Bundle' }] };
Success(props); Success(props); Success({ ...props, paymentId: 'pay_retry_same_order' });
assert.equal(purchases, 1, 'refresh must not duplicate Purchase');

const receipts = load('lib/purchase-receipt.ts', { Buffer, process: { env: { DOWNLOAD_SIGNING_SECRET: 'test-only-secret' } } });
const receipt = { paymentId: 'pay_test', orderId: 'order_test', amount: 29900, expiresAt: Date.now() + 60000 };
const token = receipts.createPurchaseReceipt(receipt);
assert.equal(receipts.readPurchaseReceipt(token).amount, 29900);
assert.equal(receipts.readPurchaseReceipt(receipts.createPurchaseReceipt({ ...receipt, amount: 14900, priceTier: 'launch_149' })).amount, 14900);
assert.equal(receipts.readPurchaseReceipt(token + 'tampered'), null);
assert.equal(receipts.readPurchaseReceipt(receipts.createPurchaseReceipt({ ...receipt, expiresAt: Date.now() - 1 })), null);
assert.equal(receipts.readPurchaseReceipt(), null);
console.log('Tracking checks passed: funnel events, offer values, UTM persistence, purchase deduplication, signed receipt validation.');
