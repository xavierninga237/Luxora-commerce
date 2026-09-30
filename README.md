# Luxora Commerce

**Timeless Luxury. Delivered Worldwide.**

A complete, front-end luxury e-commerce experience for watches and fine jewelry — storefront, customer account area, a public read-only admin dashboard, and an AI shopping concierge powered by OpenRouter (with an on-device fallback). Built as a static site in vanilla HTML, CSS and JavaScript with no build step; the only server code is one Vercel function for the concierge.

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

## Deploying to Vercel (with the live AI concierge)

1. Push this folder to a GitHub repo (or run `vercel` from inside it) and import it in Vercel. Framework preset: **Other**. No build command, no output directory — Vercel serves the folder as-is and turns `api/concierge.js` into a serverless function automatically.
2. In **Project → Settings → Environment Variables**, add:

| Variable | Required | Example | What it does |
|---|---|---|---|
| `OPENROUTER_API_KEY` | yes | `sk-or-v1-…` | Your key from [openrouter.ai/keys](https://openrouter.ai/keys). Stays on the server; never sent to the browser. |
| `OPENROUTER_MODEL` | no | `openai/gpt-4o-mini` | Any model id from [openrouter.ai/models](https://openrouter.ai/models). Defaults to `openai/gpt-4o-mini`. |
| `OPENROUTER_SITE_URL` | no | `https://luxora.vercel.app` | Sent as `HTTP-Referer` so the app shows up under your site in OpenRouter. |
| `OPENROUTER_APP_NAME` | no | `Luxora Commerce` | Sent as `X-Title` (the name in your OpenRouter dashboard). |

3. **Redeploy** (environment variables only apply to new deployments).
4. Open `/pages/ai-assistant.html`. The chat header reads **Live AI · model-name** when the key is picked up, or **Runs on your device** when it isn't.

`.env.example` lists the same variables. For local testing with the real function, copy it to `.env.local` and run `vercel dev`.

**Cost & abuse guard.** Each request is capped (600-character message, 8 turns of history, 500 output tokens) and each server instance allows 12 requests per minute per IP. For a public portfolio, also set a monthly credit limit on the key in OpenRouter.

**If anything fails** — no key, OpenRouter down, rate-limited, or the site opened from `file://` — the chat silently falls back to the built-in rule-based engine, so the concierge never breaks in front of a visitor.

### Links to share
- Storefront: `https://your-project.vercel.app/`
- Admin demo (no password, read-only): `https://your-project.vercel.app/admin`

---

## What's inside

### Storefront
- **Homepage** with hero, animated metrics, category and collection tiles, featured/bestseller grids, a new-arrivals rail, a live concierge preview, testimonials and newsletter capture.
- **Shop** with faceted filtering (category, brand, material, price), sorting, pagination, instant search, and fully URL-synced state (every filter is shareable and survives a refresh).
- **Product pages** with an image gallery (zoom + 360° sweep), specifications, verified reviews with an AI-written summary, related pieces, and structured data (JSON-LD).
- **Cart & checkout** — slide-out cart drawer, a dedicated cart page with live coupon codes, and a three-step checkout (contact → shipping → payment) with validation and an order-confirmation page.
- **Wishlist, compare (up to four, with an AI verdict), collections, journal, about, FAQ and contact** pages.

### AI concierge (the differentiator)
Two engines behind one chat UI:
- **Live model (on Vercel).** `api/concierge.js` sends the conversation to OpenRouter with the whole catalogue (64 products, compactly encoded), store policies and active coupon codes in the system prompt. The model answers in the house voice and returns product slugs, which the UI renders as product cards. Slugs are validated server-side, so the model can't recommend a piece that doesn't exist.
- **On-device engine (fallback).** A rule-based recommender that parses free text ("a wedding gift under $4,000", "titanium watch for my husband") into structured intent, scores every product, and explains *why* each piece was chosen. It also powers:
  - **Gift finder** — a four-question guided quiz.
  - **Comparison verdict** — pros, cons and a recommendation across compared pieces.
  - **Review summariser** — recurring themes from a product's reviews.

### Customer account
Dashboard with order history, wishlist, saved addresses, and profile settings. A lightweight fake session persists in `localStorage`.

### Mobile shopping experience
- Two-column product grid, compact cards with a one-tap wishlist heart, and "Add to bag" always visible on touch screens.
- App-style bottom tab bar (Home, Shop, Concierge, Wishlist, Bag with live counts).
- Shop filters open as a bottom sheet with a live "Show N pieces" button; quick category chips sit above the grid.
- Product page: swipe or tap through photos (zoom is desktop-only), and a sticky buy bar appears once the main "Add to bag" scrolls away.
- The concierge chat fills the phone screen, with suggested prompts as a swipeable row.

### Admin dashboard (public demo)
A full back-office at **`/admin`** (→ `admin/dashboard.html`). There is **no password on purpose**, so recruiters and clients can open it straight from your portfolio.
- KPIs with sparklines, revenue/orders/channel/region charts (hand-drawn inline SVG, **no charting library**).
- Sortable, searchable, filterable tables for products, inventory, orders, customers, reviews and coupons, each with realistic row actions (Edit, Delete, Refund, Approve, Restock…).
- **Read-only demo mode.** A banner on every admin page says it's a demo. Every write action — Delete, Edit, Refund, Add product, New coupon, Save settings and any form submit — is intercepted and opens a "This admin is read-only" dialog naming the blocked action. Browsing, search, sorting, filters and charts all work normally. There is no write API behind the admin at all, so nothing a visitor does can change what other visitors see.

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
│   └── images/                 logos, products (WebP photos), collections, hero, brands, avatars
├── api/concierge.js            Vercel serverless function → OpenRouter (AI concierge)
├── vercel.json                 /admin redirect, function config, cache headers
├── .env.example                Environment variables to set in Vercel
├── data/                       The same seed data as JSON (products, reviews, orders, customers)
└── tools/                      Python generators used to build the assets, data and pages
```

### How it's wired
- **One data source.** `assets/js/data/luxora-data.js` exposes `window.LUXORA` with every product, review, order, customer, coupon and analytics series. The `data/*.json` files mirror it for anyone who wants to consume it as JSON.
- **`window.LX` namespace.** All behaviour hangs off a single global (`core/utils.js`), so scripts are plain classic `<script>` tags — no bundler, no modules, works over `file://`.
- **Shared chrome.** The header, mega-menu, footer and drawers are injected by `core/chrome.js` into `[data-chrome]` slots, so they live in exactly one place.
- **Product photography.** Each product has 1–3 WebP photos in `assets/images/products/`, named after its slug: `slug.webp` is the default image, then `slug-2.webp`, `slug-3.webp`. The product page gallery shows all of them (arrows, thumbnails, swipe on mobile, click to zoom), and product cards cross-fade to the second photo on hover. Photos were resized to 1400 px and re-encoded (≈108 MB of originals → ≈7.5 MB).
- **Adding or replacing a photo:** drop the file into `assets/images/products/` using the naming above, then add its path to that product's `images` array in `assets/js/data/luxora-data.js` (and `data/products.json`, which the concierge function reads).
- **Category, collection, journal and editorial images** live in `assets/images/scenes/` and are cropped from the product photography, so there are no drawn placeholders left.

---

## How the concierge talks to OpenRouter

- Browser: `LX.AI.replyLive(text, history)` in `assets/js/features/ai.js` checks `GET /api/concierge` once (`{ live, model }`), then `POST`s `{ message, history }`. Any failure resolves to the local `LX.AI.reply()` instead of throwing.
- Server: `api/concierge.js` builds the system prompt from `data/products.json` and `data/luxora.json`, calls `https://openrouter.ai/api/v1/chat/completions`, and returns `{ text, picks: [slug…], model }`.
- To change the concierge's personality or rules, edit the `SYSTEM` prompt at the top of `api/concierge.js`.

---

## Regenerating assets (optional)

The `tools/` folder holds the Python scripts that produced the images, seed data and HTML pages (`build_logo_assets.py`, `build_product_art.py`, `build_scene_art.py`, `catalog.py`, `export_data.py`, `build_pages_*.py`). You don't need them to run the site — they're included so the generation approach is transparent and repeatable. They require Python 3 with Pillow and NumPy.

It also contains two browser tests, run against a real headless Chromium via Playwright:

```bash
node tools/smoke_test.js   # loads all 33 pages (web fonts are stubbed so it runs offline), asserts chrome renders, fails on any console error
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
