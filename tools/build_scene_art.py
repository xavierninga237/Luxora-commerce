"""Hero, collection, brand, texture and avatar artwork for Luxora Commerce."""
import os, math, random, sys
sys.path.insert(0, "/home/claude/tools")
from catalog import BRANDS, COLLECTIONS, CATEGORIES
import build_product_art as art

ROOT = "/home/claude/luxora-commerce/assets/images"
GOLD = "#C9A14A"


def w(path, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(body)


def base_defs(seed=0, warm=".18"):
    return f"""<defs>
  <radialGradient id="bg" cx="52%" cy="40%" r="78%">
    <stop offset="0%" stop-color="#1D1B16"/><stop offset="58%" stop-color="#101010"/>
    <stop offset="100%" stop-color="#070707"/></radialGradient>
  <radialGradient id="glow" cx="50%" cy="42%" r="52%">
    <stop offset="0%" stop-color="{GOLD}" stop-opacity="{warm}"/>
    <stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/></radialGradient>
  <linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="900">
    <stop offset="0%" stop-color="#8A6A22"/><stop offset="28%" stop-color="#F2DFA8"/>
    <stop offset="55%" stop-color="{GOLD}"/><stop offset="78%" stop-color="#F2DFA8"/>
    <stop offset="100%" stop-color="#8A6A22"/></linearGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="26"/></filter>
</defs>"""


# ------------------------------------------------------------------ hero
def hero():
    W, H = 1600, 1000
    rng = random.Random(7)
    cx, cy, r = 1090, 470, 300
    rings = "".join(
        f'<circle cx="{cx}" cy="{cy}" r="{r+60+i*74}" fill="none" stroke="{GOLD}" '
        f'stroke-opacity="{0.10 - i*0.022:.3f}" stroke-width="1"/>' for i in range(4))
    ticks = ""
    for i in range(60):
        a = math.radians(i * 6)
        ro = r + 44
        ri = ro - (18 if i % 5 == 0 else 8)
        ticks += (f'<line x1="{cx+math.sin(a)*ri:.1f}" y1="{cy-math.cos(a)*ri:.1f}" '
                  f'x2="{cx+math.sin(a)*ro:.1f}" y2="{cy-math.cos(a)*ro:.1f}" '
                  f'stroke="{GOLD}" stroke-opacity="{0.5 if i%5==0 else 0.22}" stroke-width="2"/>')
    markers = ""
    for i in range(12):
        a = math.radians(i * 30)
        markers += (f'<line x1="{cx+math.sin(a)*(r-58):.1f}" y1="{cy-math.cos(a)*(r-58):.1f}" '
                    f'x2="{cx+math.sin(a)*(r-30):.1f}" y2="{cy-math.cos(a)*(r-30):.1f}" '
                    f'stroke="url(#metal)" stroke-width="{7 if i%3==0 else 3}" stroke-linecap="round"/>')
    hands = ""
    for length, ang, wd in ((r - 120, 310, 12), (r - 70, 62, 8)):
        a = math.radians(ang)
        hands += (f'<line x1="{cx}" y1="{cy}" x2="{cx+math.sin(a)*length:.1f}" '
                  f'y2="{cy-math.cos(a)*length:.1f}" stroke="url(#metal)" stroke-width="{wd}" '
                  f'stroke-linecap="round"/>')
    dust = "".join(
        f'<circle cx="{rng.randint(60,1540)}" cy="{rng.randint(40,960)}" '
        f'r="{rng.choice([1,1,1.5,2])}" fill="{GOLD}" opacity="{rng.uniform(.05,.22):.2f}"/>'
        for _ in range(90))
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Luxora hero timepiece">
{base_defs(warm='.22')}
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
{dust}
<ellipse cx="{cx}" cy="{cy}" rx="330" ry="330" fill="{GOLD}" opacity=".10" filter="url(#soft)"/>
{rings}{ticks}
<rect x="{cx-92}" y="{cy-r-250}" width="184" height="260" rx="26" fill="url(#metal)" opacity=".75"/>
<rect x="{cx-92}" y="{cy+r-10}" width="184" height="300" rx="26" fill="url(#metal)" opacity=".75"/>
<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#metal)"/>
<circle cx="{cx}" cy="{cy}" r="{r-22}" fill="#0A0A0A"/>
<circle cx="{cx}" cy="{cy}" r="{r-34}" fill="none" stroke="url(#metal)" stroke-width="2" stroke-opacity=".7"/>
{markers}
<circle cx="{cx-108}" cy="{cy}" r="56" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-width="2"/>
<circle cx="{cx+108}" cy="{cy}" r="56" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-width="2"/>
<circle cx="{cx}" cy="{cy+112}" r="56" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-width="2"/>
{hands}
<circle cx="{cx}" cy="{cy}" r="12" fill="url(#metal)"/>
<rect x="{cx+r-6}" y="{cy-30}" width="46" height="60" rx="10" fill="url(#metal)"/>
<linearGradient id="vig" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0%" stop-color="#0B0B0B" stop-opacity=".96"/>
  <stop offset="46%" stop-color="#0B0B0B" stop-opacity=".55"/>
  <stop offset="100%" stop-color="#0B0B0B" stop-opacity="0"/></linearGradient>
<rect width="{W}" height="{H}" fill="url(#vig)"/>
</svg>"""
    w(f"{ROOT}/hero/hero-timepiece.svg", svg)


# ------------------------------------------------- collection & category tiles
MOTIF = {
    "watches": "watch", "rings": "ring", "necklaces": "necklace",
    "bracelets": "bracelet", "earrings": "earring", "accessories": "case",
}


def motif(kind, rng):
    if kind == "watch":
        return ('<circle cx="300" cy="300" r="150" fill="none" stroke="url(#metal)" stroke-width="16"/>'
                '<circle cx="300" cy="300" r="118" fill="none" stroke="url(#metal)" stroke-width="2" stroke-opacity=".6"/>'
                '<line x1="300" y1="300" x2="300" y2="205" stroke="url(#metal)" stroke-width="9" stroke-linecap="round"/>'
                '<line x1="300" y1="300" x2="372" y2="342" stroke="url(#metal)" stroke-width="6" stroke-linecap="round"/>'
                '<rect x="262" y="106" width="76" height="60" rx="14" fill="url(#metal)" opacity=".7"/>'
                '<rect x="262" y="434" width="76" height="60" rx="14" fill="url(#metal)" opacity=".7"/>')
    if kind == "ring":
        return ('<ellipse cx="300" cy="340" rx="145" ry="142" fill="none" stroke="url(#metal)" stroke-width="30"/>'
                '<path d="M255 205 Q300 172 345 205" fill="none" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>'
                '<path d="M256 176 L300 128 L344 176 L300 226 Z" fill="url(#metal)"/>')
    if kind == "necklace":
        return ('<path d="M140 140 Q300 520 460 140" fill="none" stroke="url(#metal)" stroke-width="9"/>'
                '<circle cx="300" cy="352" r="14" fill="none" stroke="url(#metal)" stroke-width="6"/>'
                '<path d="M258 392 L300 356 L342 392 L300 462 Z" fill="url(#metal)"/>')
    if kind == "bracelet":
        s = ""
        for i in range(18):
            a = math.radians(i * 20)
            x, y = 300 + math.cos(a) * 178, 320 + math.sin(a) * 128
            s += (f'<g transform="translate({x:.1f},{y:.1f}) rotate({math.degrees(a)+90:.1f})">'
                  f'<rect x="-17" y="-12" width="34" height="24" rx="11" fill="none" '
                  f'stroke="url(#metal)" stroke-width="9"/></g>')
        return s
    if kind == "earring":
        s = ""
        for cx in (212, 388):
            s += (f'<circle cx="{cx}" cy="330" r="82" fill="none" stroke="url(#metal)" stroke-width="17"/>'
                  f'<circle cx="{cx}" cy="222" r="13" fill="url(#metal)"/>')
        return s
    return ('<path d="M140 300 L300 226 L460 300 L300 374 Z" fill="url(#metal)" opacity=".85"/>'
            '<path d="M140 300 L140 452 L300 526 L300 374 Z" fill="url(#metal)" opacity=".45"/>'
            '<path d="M460 300 L460 452 L300 526 L300 374 Z" fill="url(#metal)" opacity=".22"/>')


def tile(path, kind, label, seed, W=600, H=750):
    rng = random.Random(seed)
    grain = "".join(
        f'<circle cx="{rng.randint(0,W)}" cy="{rng.randint(0,H)}" r="{rng.choice([1,1,1.5])}" '
        f'fill="{GOLD}" opacity="{rng.uniform(.04,.15):.2f}"/>' for _ in range(46))
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{label}">
{base_defs()}
<rect width="{W}" height="{H}" fill="url(#bg)"/><rect width="{W}" height="{H}" fill="url(#glow)"/>
{grain}
<g transform="translate(0,120)">{motif(kind, rng)}</g>
<rect x="24" y="24" width="{W-48}" height="{H-48}" fill="none" stroke="{GOLD}" stroke-opacity=".14"/>
<line x1="60" y1="{H-150}" x2="{W-60}" y2="{H-150}" stroke="{GOLD}" stroke-opacity=".3"/>
</svg>"""
    w(path, svg)


# ------------------------------------------------------------------ brands
def brand_logo(slug, name):
    W, H = 420, 120
    letters = " ".join(name.upper())
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{name}">
<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{W}" y2="{H}">
<stop offset="0%" stop-color="#8A6A22"/><stop offset="35%" stop-color="#F2DFA8"/>
<stop offset="65%" stop-color="{GOLD}"/><stop offset="100%" stop-color="#8A6A22"/></linearGradient></defs>
<text x="{W/2}" y="{H/2+2}" text-anchor="middle" dominant-baseline="middle" fill="url(#g)"
  font-family="Cormorant Garamond, Georgia, serif" font-size="42" letter-spacing="2">{letters}</text>
<line x1="{W/2-90}" y1="{H/2+30}" x2="{W/2+90}" y2="{H/2+30}" stroke="{GOLD}" stroke-opacity=".45"/>
<path d="M{W/2-7} {H/2+30} L{W/2} {H/2+23} L{W/2+7} {H/2+30} L{W/2} {H/2+37} Z" fill="{GOLD}" opacity=".8"/>
</svg>"""
    w(f"{ROOT}/brands/{slug}.svg", svg)


# ------------------------------------------------------------------ avatars
def avatar(initials, seed, tone):
    rng = random.Random(seed)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="{initials}">
<defs><radialGradient id="a" cx="38%" cy="30%" r="80%">
<stop offset="0%" stop-color="{tone}" stop-opacity=".55"/><stop offset="100%" stop-color="#141414"/></radialGradient>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="200">
<stop offset="0%" stop-color="#F2DFA8"/><stop offset="100%" stop-color="#8A6A22"/></linearGradient></defs>
<rect width="200" height="200" fill="url(#a)"/>
<circle cx="100" cy="100" r="78" fill="none" stroke="{GOLD}" stroke-opacity=".35"/>
<text x="100" y="104" text-anchor="middle" dominant-baseline="middle" fill="url(#g)"
 font-family="Cormorant Garamond, Georgia, serif" font-size="70" letter-spacing="3">{initials}</text>
</svg>"""
    w(f"{ROOT}/avatars/{initials.lower()}.svg", svg)


# ------------------------------------------------------------------ textures
def texture(name, kind):
    rng = random.Random(hash(name) % 9999)
    W = H = 900
    if kind == "marble":
        veins = "".join(
            f'<path d="M{rng.randint(-100,900)} {rng.randint(0,900)} '
            f'C{rng.randint(0,900)} {rng.randint(0,900)}, {rng.randint(0,900)} {rng.randint(0,900)}, '
            f'{rng.randint(0,1000)} {rng.randint(0,900)}" fill="none" stroke="{GOLD}" '
            f'stroke-opacity="{rng.uniform(.05,.22):.2f}" stroke-width="{rng.uniform(.6,2.4):.1f}"/>'
            for _ in range(34))
        inner = veins
    else:
        inner = "".join(
            f'<rect x="0" y="{i*18}" width="900" height="{rng.uniform(3,11):.1f}" fill="{GOLD}" '
            f'opacity="{rng.uniform(.03,.13):.2f}"/>' for i in range(50))
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{name} texture">
{base_defs(warm='.10')}
<rect width="{W}" height="{H}" fill="url(#bg)"/>{inner}<rect width="{W}" height="{H}" fill="url(#glow)"/>
</svg>"""
    w(f"{ROOT}/textures/{name}.svg", svg)


if __name__ == "__main__":
    hero()
    for i, (slug, name, _) in enumerate(CATEGORIES):
        tile(f"{ROOT}/collections/cat-{slug}.svg", MOTIF[slug], name, 100 + i)
    kinds = ["watch", "ring", "necklace", "bracelet", "earring", "case"]
    for i, (slug, name, _) in enumerate(COLLECTIONS):
        tile(f"{ROOT}/collections/{slug}.svg", kinds[i % len(kinds)], name, 400 + i, 800, 600)
    for slug, name, _ in BRANDS:
        brand_logo(slug, name)
    for ini, tone in [("AR", "#C9A14A"), ("MK", "#2E5FA3"), ("JD", "#1F7A54"),
                      ("SL", "#8A6A4A"), ("TP", "#7E858E"), ("EN", "#9A6A55")]:
        avatar(ini, hash(ini) % 999, tone)
    texture("dark-marble", "marble")
    texture("gold-leaf", "brushed")
    texture("brushed-metal", "brushed")
    print("scene art complete")
