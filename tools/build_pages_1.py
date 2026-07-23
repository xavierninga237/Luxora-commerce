"""Generate every HTML page for Luxora Commerce from shared fragments."""
import os
ROOT = "/home/claude/luxora-commerce"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?'
         'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&'
         'family=Inter:wght@400;500;600;700&'
         'family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">')


def head(title, desc, rel, extra_css=""):
    css = ["tokens", "base", "components", "layout", "pages"]
    if extra_css:
        css.append(extra_css)
    links = "".join('<link rel="stylesheet" href="%sassets/css/%s.css">' % (rel, c) for c in css)
    return f'''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="{rel}assets/images/logos/og-image.jpg">
<meta name="theme-color" content="#0B0B0B">
<link rel="icon" href="{rel}assets/images/logos/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="{rel}assets/images/logos/apple-touch-icon.png">
{FONTS}
{links}
</head>'''


# Storefront scripts: data first, then core, then features.
def scripts(rel, features):
    order = ["core/utils", "core/store", "core/ui", "core/chrome",
             "features/ai"] + features
    tags = ['<script src="%sassets/js/data/luxora-data.js"></script>' % rel]
    tags += ['<script src="%sassets/js/%s.js"></script>' % (rel, m) for m in order]
    return "\n".join(tags)


def storefront(title, desc, rel, body, features=None, extra_css=""):
    features = features or []
    return head(title, desc, rel, extra_css) + f'''
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div data-chrome="header"></div>
<main id="main">
{body}
</main>
<div data-chrome="footer"></div>
<div data-chrome="drawers"></div>
{scripts(rel, features)}
</body>
</html>'''


def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(html)
    return path


# ========================================================================= home
HOME = '''
<section id="home"></section>
<section class="hero">
  <div class="hero__media"><img src="REL/assets/images/hero/hero-suite.svg" alt="A Luxora timepiece with fine jewelry"></div>
  <div class="shell hero__inner">
    <div class="hero__content">
      <span class="eyebrow">Timeless Luxury. Delivered Worldwide.</span>
      <h1 class="hero__title">Crafted for those who appreciate <em>timeless luxury</em></h1>
      <p class="hero__sub">Discover premium watches and fine jewelry designed to celebrate life's finest moments — made in small runs, inspected by hand.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="REL/pages/shop.html">Shop the collection</a>
        <a class="btn btn--secondary btn--lg" href="REL/pages/shop.html?categories=rings,necklaces,bracelets,earrings">Explore jewelry</a>
      </div>
    </div>
  </div>
  <a class="hero__scroll" data-action="scroll-to" data-target="#metrics">Scroll</a>
</section>

<section class="metrics" id="metrics">
  <div class="shell"><div class="metrics__grid">
    <div class="metrics__item"><div class="metrics__value" data-countup="15000" data-suffix="+">0</div><div class="metrics__label">Satisfied clients</div></div>
    <div class="metrics__item"><div class="metrics__value" data-countup="120" data-suffix="+">0</div><div class="metrics__label">Luxury pieces</div></div>
    <div class="metrics__item"><div class="metrics__value" data-countup="98" data-suffix="%">0</div><div class="metrics__label">Would recommend</div></div>
    <div class="metrics__item"><div class="metrics__value">Global</div><div class="metrics__label">Insured shipping</div></div>
  </div></div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head section-head--center">
      <span class="eyebrow eyebrow--center">Shop by category</span>
      <h2>Six disciplines, one house</h2>
    </div>
    <div class="grid grid--3" id="home-categories"></div>
  </div>
</section>

<section class="section section--deep">
  <div class="shell">
    <div class="section-head section-head--split">
      <div><span class="eyebrow">The edit</span><h2>Featured pieces</h2></div>
      <a class="link-line" href="REL/pages/shop.html">View all <span>&rarr;</span></a>
    </div>
    <div class="grid grid--4" id="home-featured"></div>
  </div>
</section>

<section class="section" data-rail>
  <div class="shell">
    <div class="section-head section-head--split">
      <div><span class="eyebrow">Just landed</span><h2>New arrivals</h2></div>
      <div class="rail-nav">
        <button class="icon-btn" data-rail-dir="prev" aria-label="Previous">&larr;</button>
        <button class="icon-btn" data-rail-dir="next" aria-label="Next">&rarr;</button>
      </div>
    </div>
  </div>
  <div class="shell"><div class="rail" id="home-arrivals"></div></div>
</section>

<section class="section section--deep">
  <div class="shell">
    <div class="ai-shell" style="align-items:center">
      <div>
        <span class="eyebrow">The concierge</span>
        <h2>Find your perfect piece with AI</h2>
        <p class="lead">Describe the occasion, the person, and your budget in plain words. The concierge reads the whole catalogue and answers with pieces worth considering — and tells you why.</p>
        <div class="cluster" style="margin:1.5rem 0">
          <a class="btn btn--primary" href="REL/pages/ai-assistant.html">Open the concierge</a>
          <a class="btn btn--secondary" href="REL/pages/gift-finder.html">Try the gift finder</a>
        </div>
      </div>
      <div class="chat" style="height:auto">
        <div class="chat__head"><span class="chat__dot"></span><strong style="font-size:var(--step--1)">Luxora Concierge</strong></div>
        <div class="chat__log" id="home-ai-log" style="max-height:340px"></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head section-head--split">
      <div><span class="eyebrow">Most wanted</span><h2>Bestsellers</h2></div>
      <a class="link-line" href="REL/pages/shop.html?sort=rating">Top rated <span>&rarr;</span></a>
    </div>
    <div class="grid grid--3" id="home-bestsellers"></div>
  </div>
</section>

<section class="section section--deep">
  <div class="shell">
    <div class="grid grid--3">
      <div class="card card--flat"><div class="text-gold">SHIELD</div>
        <h3 style="font-size:1.5rem;margin-top:1rem">Worldwide shipping</h3>
        <p>Insured, tracked and signed for, to more than 60 countries. Free over $500.</p></div>
      <div class="card card--flat"><div class="text-gold">WARRANTY</div>
        <h3 style="font-size:1.5rem;margin-top:1rem">Two-year warranty</h3>
        <p>Every piece is covered against manufacturing faults, and built to outlast the paperwork.</p></div>
      <div class="card card--flat"><div class="text-gold">SECURE</div>
        <h3 style="font-size:1.5rem;margin-top:1rem">Secure payments</h3>
        <p>Stripe, PayPal, Apple Pay and Google Pay. Your details never touch our servers.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-head section-head--center">
      <span class="eyebrow eyebrow--center">In their words</span>
      <h2>What clients say</h2>
    </div>
    <div class="grid grid--3" id="home-quotes"></div>
  </div>
</section>

<section class="section section--deep">
  <div class="shell">
    <div class="editorial">
      <img src="REL/assets/images/collections/heritage.svg" alt="Craftsmanship" loading="lazy">
      <div>
        <span class="eyebrow">The house</span>
        <h2>Every piece tells a story</h2>
        <p class="lead">A Luxora piece begins as a drawing and ends in your hands months later, having passed through the same pair of eyes twice. We keep runs small on purpose: it is the only way to inspect every clasp, every setting, every finished edge.</p>
        <a class="link-line" href="REL/pages/about.html">Read our story <span>&rarr;</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section--tight section">
  <div class="shell">
    <div class="rule"><i></i></div>
    <p class="center muted" style="letter-spacing:.2em;text-transform:uppercase;font-size:var(--step--2);margin-bottom:2rem">The houses of Luxora</p>
    <div class="cluster" id="home-brands" style="justify-content:center;gap:3rem;flex-wrap:wrap"></div>
  </div>
</section>

<section class="section">
  <div class="shell shell--tight">
    <div class="newsletter">
      <span class="eyebrow eyebrow--center">Stay close</span>
      <h2>Join the Luxora Circle</h2>
      <p class="lead" style="margin-inline:auto">Early access to limited editions, private previews, and 10% off your first order.</p>
      <form onsubmit="event.preventDefault();window.LX.toast('Welcome to the Circle','Check your inbox for your code.');this.reset();">
        <input class="input" type="email" placeholder="Your email address" required aria-label="Email">
        <button class="btn btn--primary" type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</section>
'''

write("index.html", storefront(
    "Luxora Commerce — Timeless Luxury. Delivered Worldwide.",
    "Premium AI-powered luxury commerce. Watches and fine jewelry, made in small runs and delivered worldwide.",
    "", HOME.replace("REL/", ""), features=["features/pages"]))

print("index.html written")
