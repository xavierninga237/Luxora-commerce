const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function allPages(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f === 'tools' || f === 'assets' || f === 'data') continue;
      allPages(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const pages = allPages(ROOT).sort();
  let totalErrors = 0;
  const report = [];

  for (const file of pages) {
    const ctx = await browser.newContext();
    // Stub web fonts so the test runs offline; a missing font is not a site bug.
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '' }));
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.waitForTimeout(700);

    // Probe the things that were broken.
    const probe = await page.evaluate(() => {
      const q = s => document.querySelectorAll(s).length;
      return {
        LX: typeof window.LX,
        icon: typeof (window.LX && window.LX.icon),
        header: q('.site-header'),
        navLinks: q('.nav__links a'),
        footer: q('.site-footer'),
        cartDrawer: q('#cart-drawer'),
        productCards: q('.product-card'),
        svgIcons: q('.nav__tools svg'),
      };
    });

    const rel = file.replace(ROOT + '/', '');
    const isAdmin = rel.startsWith('admin/');
    const isAuth = rel.startsWith('auth/');
    const needsChrome = !isAdmin && !isAuth;

    const problems = [];
    if (probe.LX !== 'object') problems.push('LX missing');
    if (probe.icon !== 'function') problems.push('LX.icon missing');
    if (needsChrome && probe.header === 0) problems.push('no header');
    if (needsChrome && probe.navLinks === 0) problems.push('NO MENU');
    if (needsChrome && probe.footer === 0) problems.push('no footer');
    errors
      .filter(e => !/fonts\.googleapis|403|ERR_FAILED|ERR_BLOCKED/.test(e))
      .forEach(e => problems.push('console: ' + e.slice(0, 110)));

    totalErrors += problems.length;
    report.push({ rel, probe, problems });
    await ctx.close();
  }

  for (const r of report) {
    const status = r.problems.length ? 'FAIL' : 'ok  ';
    let line = `${status} ${r.rel.padEnd(34)} nav:${String(r.probe.navLinks).padStart(2)} cards:${String(r.probe.productCards).padStart(2)}`;
    console.log(line);
    r.problems.forEach(p => console.log('        └─ ' + p));
  }
  console.log('\n' + '='.repeat(60));
  console.log(pages.length + ' pages tested, ' + totalErrors + ' problems found');
  await browser.close();
})();
