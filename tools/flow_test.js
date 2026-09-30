const { chromium } = require('playwright');
const B = 'file://' + require('path').resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => {
    if (m.type() === 'error' && !/fonts\.googleapis|403|ERR_/.test(m.text())) errs.push(m.text());
  });

  const log = (k, v) => console.log(k.padEnd(28) + v);

  // ---------------------------------------------------------- AI concierge
  await p.goto(B + '/pages/ai-assistant.html', { waitUntil: 'load' });
  await p.waitForTimeout(600);
  await p.fill('#chat-input', 'I need a wedding gift under $4000');
  await p.click('#chat-form button[type=submit]');
  await p.waitForTimeout(1200);
  const ai = await p.evaluate(() => ({
    msgs: document.querySelectorAll('.msg').length,
    picks: document.querySelectorAll('.ai-pick').length,
    last: document.querySelectorAll('.msg__bubble')[document.querySelectorAll('.msg__bubble').length - 1].textContent.slice(0, 80)
  }));
  log('AI messages:', ai.msgs);
  log('AI product picks:', ai.picks);
  log('AI reply:', ai.last.replace(/\s+/g, ' '));

  // ------------------------------------------------------------ chip prompt
  await p.click('[data-prompt="A luxury watch under $1000"]').catch(() => {});
  await p.waitForTimeout(1100);
  log('after chip, picks:', await p.evaluate(() => document.querySelectorAll('.ai-pick').length));

  // ------------------------------------------------------------ product page
  const slug = await p.evaluate(() => window.LUXORA.products[2].slug);
  await p.goto(B + '/pages/product.html?p=' + slug, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const pdp = await p.evaluate(() => ({
    title: (document.querySelector('.pdp h1') || {}).textContent,
    price: (document.querySelector('.pdp .price') || {}).textContent,
    thumbs: document.querySelectorAll('.gallery__thumb').length,
    reviews: document.querySelectorAll('.review').length,
    related: document.querySelectorAll('.product-card').length,
    jsonld: !!document.querySelector('script[type="application/ld+json"]')
  }));
  log('PDP title:', pdp.title);
  log('PDP price:', pdp.price);
  log('PDP thumbs/reviews/related:', `${pdp.thumbs} / ${pdp.reviews} / ${pdp.related}`);
  log('PDP JSON-LD:', pdp.jsonld);

  // add to bag from the PDP
  await p.click('[data-action="add"]').catch(() => {});
  await p.waitForTimeout(400);
  log('cart badge after add:', await p.evaluate(() => (document.querySelector('[data-count-for=cart-count]') || {}).textContent));

  // --------------------------------------------------------------- checkout
  await p.goto(B + '/pages/checkout.html', { waitUntil: 'load' });
  await p.waitForTimeout(700);
  await p.fill('[name=firstName]', 'Marcus');
  await p.fill('[name=lastName]', 'Reyes');
  await p.fill('[name=email]', 'marcus@example.com');
  await p.click('#to-shipping');
  await p.waitForTimeout(400);
  await p.fill('[name=address]', '128 Park Avenue');
  await p.fill('[name=city]', 'New York');
  await p.fill('[name=postal]', '10016');
  await p.selectOption('[name=country]', 'United States');
  await p.click('#to-payment');
  await p.waitForTimeout(400);
  log('reached payment step:', await p.evaluate(() => !document.querySelector('[data-step-panel="3"]').hidden));
  await p.fill('[name=card]', '4242 4242 4242 4242');
  await p.fill('[name=expiry]', '12 / 28');
  await p.fill('[name=cvc]', '123');
  await p.check('[name=terms]');
  await p.click('#place-order');
  await p.waitForTimeout(1600);
  log('confirmation URL:', p.url().split('/').pop().slice(0, 40));
  const conf = await p.evaluate(() => ({
    heading: (document.querySelector('#confirmation h1') || {}).textContent,
    total: (document.querySelector('.summary__row--total') || {}).textContent
  }));
  log('confirmation heading:', (conf.heading || '').replace(/\s+/g, ' '));
  log('confirmation total:', (conf.total || '').replace(/\s+/g, ' '));

  // ------------------------------------------------------------------ admin
  await p.goto(B + '/admin/dashboard.html', { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const adm = await p.evaluate(() => ({
    kpis: document.querySelectorAll('.kpi').length,
    svgs: document.querySelectorAll('.admin__body svg').length,
    rows: document.querySelectorAll('#admin-recent-orders tr').length,
    top: document.querySelectorAll('#admin-top-products .cart-line').length,
    legend: (document.querySelector('#legend-channels') || {}).textContent
  }));
  log('ADMIN kpis:', adm.kpis);
  log('ADMIN svg charts:', adm.svgs);
  log('ADMIN recent orders:', adm.rows);
  log('ADMIN top products:', adm.top);
  log('ADMIN channel legend:', (adm.legend || '').replace(/\s+/g, ' ').slice(0, 60));

  // admin products table: search + sort
  await p.goto(B + '/admin/products.html', { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const before = await p.evaluate(() => document.querySelectorAll('#admin-products-table tbody tr').length);
  await p.fill('#admin-products-search', 'titanium');
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => document.querySelectorAll('#admin-products-table tbody tr').length);
  log('ADMIN table rows:', `${before} -> ${after} after search`);

  console.log('\n' + '='.repeat(50));
  console.log(errs.length ? 'JS ERRORS:\n' + errs.join('\n') : 'NO JS ERRORS ACROSS ALL FLOWS');
  await browser.close();
})();
