"""Composite hero: a watch alongside fine jewelry, so the hero reads
'watches AND jewelry' rather than 'watch shop'."""
import math, os, random

ROOT = "/home/claude/luxora-commerce/assets/images"
GOLD = "#C9A14A"
W, H = 1600, 1000


def defs():
    return f"""<defs>
  <radialGradient id="bg" cx="58%" cy="40%" r="80%">
    <stop offset="0%" stop-color="#1D1B16"/><stop offset="58%" stop-color="#101010"/>
    <stop offset="100%" stop-color="#070707"/></radialGradient>
  <radialGradient id="glow" cx="62%" cy="42%" r="55%">
    <stop offset="0%" stop-color="{GOLD}" stop-opacity=".20"/>
    <stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/></radialGradient>
  <linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="700" y1="100" x2="1500" y2="950">
    <stop offset="0%" stop-color="#8A6A22"/><stop offset="26%" stop-color="#F2DFA8"/>
    <stop offset="52%" stop-color="{GOLD}"/><stop offset="76%" stop-color="#F7E8BC"/>
    <stop offset="100%" stop-color="#8A6A22"/></linearGradient>
  <linearGradient id="metalV" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
    <stop offset="0%" stop-color="#F7E8BC"/><stop offset="45%" stop-color="{GOLD}"/>
    <stop offset="100%" stop-color="#7A5D1E"/></linearGradient>
  <linearGradient id="silver" gradientUnits="userSpaceOnUse" x1="600" y1="600" x2="1100" y2="1000">
    <stop offset="0%" stop-color="#6E747B"/><stop offset="35%" stop-color="#E8ECF1"/>
    <stop offset="65%" stop-color="#AAB2BB"/><stop offset="100%" stop-color="#5A6067"/></linearGradient>
  <radialGradient id="gem" cx="38%" cy="30%" r="72%">
    <stop offset="0%" stop-color="#FFFFFF"/><stop offset="38%" stop-color="#DCEAFF"/>
    <stop offset="100%" stop-color="#7E9BC4"/></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="30"/></filter>
  <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="vig" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#0B0B0B" stop-opacity=".97"/>
    <stop offset="28%" stop-color="#0B0B0B" stop-opacity=".70"/>
    <stop offset="48%" stop-color="#0B0B0B" stop-opacity=".18"/>
    <stop offset="70%" stop-color="#0B0B0B" stop-opacity="0"/></linearGradient>
</defs>"""


def facets(cx, cy, r, n=8, op=".55"):
    """Gem facet lines radiating from the crown."""
    out = ""
    for i in range(n):
        a = math.radians(i * (360 / n) + 22)
        out += (f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{cx+math.cos(a)*r:.1f}" '
                f'y2="{cy+math.sin(a)*r:.1f}" stroke="#FFFFFF" stroke-opacity="{op}" stroke-width="1"/>')
    return out


def watch(cx, cy, r):
    ticks = ""
    for i in range(60):
        a = math.radians(i * 6)
        ro = r + 34
        ri = ro - (15 if i % 5 == 0 else 7)
        ticks += (f'<line x1="{cx+math.sin(a)*ri:.1f}" y1="{cy-math.cos(a)*ri:.1f}" '
                  f'x2="{cx+math.sin(a)*ro:.1f}" y2="{cy-math.cos(a)*ro:.1f}" '
                  f'stroke="{GOLD}" stroke-opacity="{0.5 if i%5==0 else 0.2}" stroke-width="2"/>')
    markers = ""
    for i in range(12):
        a = math.radians(i * 30)
        markers += (f'<line x1="{cx+math.sin(a)*(r-46):.1f}" y1="{cy-math.cos(a)*(r-46):.1f}" '
                    f'x2="{cx+math.sin(a)*(r-24):.1f}" y2="{cy-math.cos(a)*(r-24):.1f}" '
                    f'stroke="url(#metal)" stroke-width="{6 if i%3==0 else 3}" stroke-linecap="round"/>')
    hands = ""
    for length, ang, wd in ((r - 96, 308, 10), (r - 56, 64, 7)):
        a = math.radians(ang)
        hands += (f'<line x1="{cx}" y1="{cy}" x2="{cx+math.sin(a)*length:.1f}" '
                  f'y2="{cy-math.cos(a)*length:.1f}" stroke="url(#metal)" stroke-width="{wd}" '
                  f'stroke-linecap="round"/>')
    halo = "".join(
        f'<circle cx="{cx}" cy="{cy}" r="{r+48+i*58}" fill="none" stroke="{GOLD}" '
        f'stroke-opacity="{0.09 - i*0.02:.3f}" stroke-width="1"/>' for i in range(3))
    return f"""<g>
{halo}
<ellipse cx="{cx}" cy="{cy}" rx="{r+70}" ry="{r+70}" fill="{GOLD}" opacity=".09" filter="url(#soft)"/>
{ticks}
<rect x="{cx-70}" y="{cy-r-190}" width="140" height="200" rx="22" fill="url(#metal)" opacity=".70"/>
<rect x="{cx-70}" y="{cy+r-8}" width="140" height="230" rx="22" fill="url(#metal)" opacity=".70"/>
<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#metal)"/>
<circle cx="{cx}" cy="{cy}" r="{r-17}" fill="#0A0A0A"/>
<circle cx="{cx}" cy="{cy}" r="{r-26}" fill="none" stroke="url(#metal)" stroke-width="2" stroke-opacity=".7"/>
{markers}
<circle cx="{cx-82}" cy="{cy}" r="42" fill="none" stroke="{GOLD}" stroke-opacity=".40" stroke-width="2"/>
<circle cx="{cx+82}" cy="{cy}" r="42" fill="none" stroke="{GOLD}" stroke-opacity=".40" stroke-width="2"/>
<circle cx="{cx}" cy="{cy+86}" r="42" fill="none" stroke="{GOLD}" stroke-opacity=".40" stroke-width="2"/>
{hands}
<circle cx="{cx}" cy="{cy}" r="9" fill="url(#metal)"/>
<rect x="{cx+r-5}" y="{cy-23}" width="36" height="46" rx="9" fill="url(#metal)"/>
</g>"""


def necklace(cx, top, width, drop):
    """A draped chain with a teardrop pendant."""
    lx, rx = cx - width / 2, cx + width / 2
    by = top + drop
    path = f"M {lx} {top} Q {cx} {by + 70} {rx} {top}"
    beads = ""
    steps = 46
    for i in range(steps + 1):
        t = i / steps
        # quadratic bezier point
        x = (1 - t) ** 2 * lx + 2 * (1 - t) * t * cx + t ** 2 * rx
        y = (1 - t) ** 2 * top + 2 * (1 - t) * t * (by + 70) + t ** 2 * top
        rr = 5.4 if 0.2 < t < 0.8 else 4.2
        beads += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr}" fill="url(#metalV)"/>'
    py = by + 36
    return f"""<g>
<ellipse cx="{cx}" cy="{py+40}" rx="150" ry="90" fill="{GOLD}" opacity=".10" filter="url(#soft)"/>
<path d="{path}" fill="none" stroke="url(#metalV)" stroke-width="3" stroke-opacity=".55"/>
{beads}
<circle cx="{cx}" cy="{py-6}" r="9" fill="none" stroke="url(#metalV)" stroke-width="4"/>
<path d="M {cx} {py+6} L {cx-34} {py+52} L {cx} {py+126} L {cx+34} {py+52} Z" fill="url(#gem)"/>
<path d="M {cx-34} {py+52} L {cx+34} {py+52}" stroke="#FFFFFF" stroke-opacity=".65" stroke-width="1.5"/>
<path d="M {cx} {py+6} L {cx} {py+126}" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="1"/>
<path d="M {cx-34} {py+52} L {cx} {py+6} L {cx+34} {py+52}" fill="#FFFFFF" fill-opacity=".18"/>
</g>"""


def ring(cx, cy, r):
    return f"""<g>
<ellipse cx="{cx}" cy="{cy+r+26}" rx="{r+34}" ry="20" fill="{GOLD}" opacity=".13" filter="url(#soft2)"/>
<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*1.06:.1f}" fill="none" stroke="url(#silver)" stroke-width="17"/>
<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*1.06:.1f}" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="3"/>
<g transform="translate({cx},{cy-r*1.06-6})">
  <path d="M -30 6 L 0 -34 L 30 6 L 0 40 Z" fill="url(#gem)"/>
  <path d="M -30 6 L 30 6" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="1.6"/>
  {facets(0, 6, 30, 7, ".45")}
  <path d="M -30 6 L 0 -34 L 30 6" fill="#FFFFFF" fill-opacity=".2"/>
</g>
</g>"""


def earrings(cx, cy):
    def drop(x):
        return f"""<g>
<circle cx="{x}" cy="{cy}" r="7" fill="url(#metalV)"/>
<path d="M {x} {cy+8} L {x} {cy+34}" stroke="url(#metalV)" stroke-width="3"/>
<path d="M {x} {cy+34} L {x-22} {cy+64} L {x} {cy+112} L {x+22} {cy+64} Z" fill="url(#gem)"/>
<path d="M {x-22} {cy+64} L {x+22} {cy+64}" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1.3"/>
<path d="M {x-22} {cy+64} L {x} {cy+34} L {x+22} {cy+64}" fill="#FFFFFF" fill-opacity=".18"/>
</g>"""
    return (f'<ellipse cx="{cx}" cy="{cy+70}" rx="90" ry="70" fill="{GOLD}" opacity=".09" filter="url(#soft)"/>'
            + drop(cx - 34) + drop(cx + 34))


def build():
    rng = random.Random(11)
    dust = "".join(
        f'<circle cx="{rng.randint(60,1560)}" cy="{rng.randint(40,960)}" '
        f'r="{rng.choice([1,1,1.5,2])}" fill="{GOLD}" opacity="{rng.uniform(.05,.20):.2f}"/>'
        for _ in range(95))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="A Luxora timepiece with fine jewelry">
{defs()}
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
{dust}
{watch(1010, 395, 190)}
{necklace(1330, 170, 265, 190)}
{ring(1180, 775, 82)}
{earrings(1452, 600)}
<rect width="{W}" height="{H}" fill="url(#vig)"/>
</svg>"""
    os.makedirs(f"{ROOT}/hero", exist_ok=True)
    open(f"{ROOT}/hero/hero-suite.svg", "w").write(svg)
    print("wrote hero-suite.svg", len(svg), "bytes")


if __name__ == "__main__":
    build()
