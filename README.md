# Luxora Commerce

**Timeless Luxury. Delivered Worldwide.**

A complete, front-end luxury e-commerce experience for watches and fine jewelry — storefront, customer account area, a full admin dashboard, and an on-device AI shopping concierge. Built as a static site in vanilla HTML, CSS and JavaScript, with no build step and no backend required.

This is a portfolio demonstration. Products, brands, prices, reviews, orders and customers are fictional, and no real payments are processed.

---

## Running it

The site is fully static. There is nothing to install and nothing to compile.

**Option A — open directly.** Double-click `index.html`, or open it in any modern browser. Everything works from the local filesystem, including the AI concierge, cart, checkout and admin dashboard.

**Option B — serve locally** (recommended, avoids any browser `file://` quirks and matches production):

```bash
cd luxora-commerce
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host works too — Netlify, Vercel, GitHub Pages, S3, or a plain nginx/Apache root. Just serve the folder as-is.

> **Fonts & connectivity.** Typography (Cormorant Garamond, Inter, Geist Mono) loads from Google Fonts. Online you get the intended type; fully offline the site falls back to system fonts and still renders correctly. Everything else — data, images, AI — is local.

---

## What's inside

### Storefront
- **Homepage** with hero, animated metrics, category and collection tiles, featured/bestseller grids, a new-arrivals rail, a live concierge preview, testimonials and newsletter capture.
- **Shop** with faceted filtering (category, brand, material, price), sorting, pagination, instant search, and fully URL-synced state (every filter is shareable and survives a refresh).
- **Product pages** with an image gallery (zoom + 360° sweep), specifications, verified reviews with an AI-written summary, related pieces, and structured data (JSON-LD).
- **Cart & checkout** — slide-out cart drawer, a dedicated cart page with live coupon codes, and a three-step checkout (contact → shipping → payment) with validation and an order-confirmation page.
- **Wishlist, compare (up to four, with an AI verdict), collections, journal, about, FAQ and contact** pages.

### AI concierge (the differentiator)
A genuine rule-based recommendation engine that runs entirely in the browser — no API key, no network call.
- **Chat assistant** — parses free-text ("a wedding gift under $4,000", "titanium watch for my husband") into structured intent (category, material, occasion, recipient, budget, tone), scores every product with hard filters plus weighted signals, and explains *why* each piece was chosen.
- **Gift finder** — a four-question guided quiz that funnels into the same engine.
- **Comparison verdict** — pros, cons and a recommendation across compared pieces.
- **Review summariser** — extracts recurring themes from a product's reviews.

### Customer account
Dashboard with order history, wishlist, saved addresses, and profile settings. A lightweight fake session persists in `localStorage`.

### Admin dashboard
A full back-office at `admin/dashboard.html`:
- KPIs with sparklines, revenue/orders/channel/region charts (all hand-drawn inline SVG — **no charting library**).
- Sortable, searchable, filterable tables for products, inventory, orders, customers, reviews and coupons.
- An AI-conversations view with usage trend.

---

## Project structure

```
luxora-commerce/
├── index.html                  Homepage
├── manifest.webmanifest        PWA manifest
├── robots.txt · sitemap.xml    SEO
├── pages/                      Storefront (shop, product, cart, checkout, wishlist,
│                               compare, collections, ai-assistant, gift-finder,
│                               about, journal, faq, contact, order-confirmation)
├── auth/                       login, register, forgot-password, reset-password
├── account/                    dashboard, orders, addresses, settings
├── admin/                      dashboard, analytics, products, inventory, orders,
│                               customers, reviews, coupons, ai, settings
├── assets/
│   ├── css/                    tokens · base · components · layout · pages · admin
│   ├── js/
│   │   ├── core/               utils, store, ui, chrome (shared header/footer/drawers)
│   │   ├── features/           ai, catalog, product, checkout, ai-pages, pages, admin
│   │   └── data/               luxora-data.js  (the whole catalogue as one JS object)
│   └── images/                 logos, products (SVG), collections, hero, brands, avatars, textures
├── data/                       The same seed data as JSON (products, reviews, orders, customers)
└── tools/                      Python generators used to build the assets, data and pages
```

### How it's wired
- **One data source.** `assets/js/data/luxora-data.js` exposes `window.LUXORA` with every product, review, order, customer, coupon and analytics series. The `data/*.json` files mirror it for anyone who wants to consume it as JSON.
- **`window.LX` namespace.** All behaviour hangs off a single global (`core/utils.js`), so scripts are plain classic `<script>` tags — no bundler, no modules, works over `file://`.
- **Shared chrome.** The header, mega-menu, footer and drawers are injected by `core/chrome.js` into `[data-chrome]` slots, so they live in exactly one place.
- **Product & scene art** are deterministic SVGs generated from the catalogue, so the repo stays small and every image is crisp at any size.

---

## Making the AI concierge "real"

The engine lives in `assets/js/features/ai.js`. It's deliberately structured so the presentation layer never needs to change if you swap in a hosted model:

- `parse(text)` → structured intent
- `score(intent)` → ranked products with explanations
- `reply(text)` → the chat response object

To go live, keep `parse`/`score` (they're useful for grounding and filtering) and replace the body of `reply()` with a `fetch` to your model endpoint, passing the catalogue (or a retrieved subset) as context and returning the same `{ text, picks }` shape. There's a comment at that exact spot in the file. Nothing else in the UI needs to change.

---

## Regenerating assets (optional)

The `tools/` folder holds the Python scripts that produced the images, seed data and HTML pages (`build_logo_assets.py`, `build_product_art.py`, `build_scene_art.py`, `catalog.py`, `export_data.py`, `build_pages_*.py`). You don't need them to run the site — they're included so the generation approach is transparent and repeatable. They require Python 3 with Pillow and NumPy.

It also contains two browser tests, run against a real headless Chromium via Playwright:

```bash
node tools/smoke_test.js   # loads all 33 pages, asserts chrome renders, fails on any console error
node tools/flow_test.js    # drives the AI concierge, PDP, full checkout and the admin tables
```

`smoke_test.js` is the one worth keeping: it catches runtime errors that a syntax check can't, because a stray quote can leave a file technically parseable while breaking it at the point of use.

---

## Tech notes
- Vanilla HTML/CSS/JS — no framework, no build step, no dependencies to install.
- Responsive from ~360px up; dark theme by default with a light-theme token set defined.
- Accessibility: skip links, focus states, ARIA labelling, and reduced-motion support.
- State (cart, wishlist, compare, recently-viewed, session, orders) persists in `localStorage` under the `luxora.` prefix.
- The PWA manifest is attached by JavaScript only when the page is served over `http(s)`. Browsers treat a manifest fetched from `file://` as cross-origin and block it, so this keeps the console clean when you open `index.html` directly.

© 2026 Luxora Commerce — portfolio demonstration project.
