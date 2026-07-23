"""Generate vector product renders for the Luxora catalogue.

Every product gets a deterministic SVG render drawn from its category and
material, so the grid reads as one art-directed shoot instead of clip art.
"""
import os, math, random, json

ROOT = "/home/claude/luxora-commerce/assets/images"
W, H = 800, 1000

METALS = {
    "gold":     ("#8A6A22", "#F2DFA8", "#C9A14A"),
    "white":    ("#7E858E", "#F4F7FA", "#C6CBD2"),
    "rose":     ("#9A6A55", "#F6D8C8", "#DCA98F"),
    "dark":     ("#23262A", "#8E969F", "#4B5157"),
    "leather":  ("#4A3524", "#C79A6E", "#8A6A4A"),
    "emerald":  ("#0E3B2A", "#7FE3B4", "#1F7A54"),
    "sapphire": ("#13294B", "#8CB8F2", "#2E5FA3"),
    "pearl":    ("#8E8880", "#FFFDF8", "#DED7CB"),
}

MATERIAL_METAL = {
    "18K Gold": "gold", "White Gold": "white", "Rose Gold": "rose",
    "Platinum": "white", "Titanium": "dark", "Stainless Steel": "white",
    "Sterling Silver": "white", "Carbon Fiber": "dark",
    "Genuine Leather": "leather", "Sapphire Crystal": "sapphire",
}


def defs(metal, seed):
    d, l, m = METALS[metal]
    return f"""<defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#1C1B18"/>
      <stop offset="55%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#080808"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="44%" r="46%">
      <stop offset="0%" stop-color="{m}" stop-opacity=".16"/>
      <stop offset="100%" stop-color="{m}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="150" y1="220" x2="650" y2="790">
      <stop offset="0%" stop-color="{d}"/>
      <stop offset="26%" stop-color="{l}"/>
      <stop offset="52%" stop-color="{m}"/>
      <stop offset="74%" stop-color="{l}"/>
      <stop offset="100%" stop-color="{d}"/>
    </linearGradient>
    <linearGradient id="metalv" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="820">
      <stop offset="0%" stop-color="{l}"/>
      <stop offset="45%" stop-color="{m}"/>
      <stop offset="100%" stop-color="{d}"/>
    </linearGradient>
    <linearGradient id="glass" gradientUnits="userSpaceOnUse" x1="240" y1="280" x2="600" y2="700">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".16"/>
      <stop offset="42%" stop-color="#FFFFFF" stop-opacity=".03"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity=".10"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>"""


def frame(metal, seed):
    return (f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
            f'<rect width="{W}" height="{H}" fill="url(#halo)"/>'
            f'<rect x="26" y="26" width="{W-52}" height="{H-52}" fill="none" '
            f'stroke="#C9A14A" stroke-opacity=".13" stroke-width="1"/>')



# --------------------------------------------------------------------- shapes
def watch(rng, strap="metal"):
    cx, cy, r = 400, 460, 165
    p = []
    # strap / bracelet
    if strap == "leather":
        p.append(f'<path d="M{cx-72} {cy-r+18} L{cx-96} 90 Q{cx} 56 {cx+96} 90 '
                 f'L{cx+72} {cy-r+18} Z" fill="url(#metalv)" opacity=".85"/>')
        p.append(f'<path d="M{cx-72} {cy+r-18} L{cx-96} {H-170} Q{cx} {H-136} '
                 f'{cx+96} {H-170} L{cx+72} {cy+r-18} Z" fill="url(#metalv)" opacity=".85"/>')
    else:
        for i in range(6):
            yt = cy - r - 8 - i * 56
            yb = cy + r + 8 + i * 56
            wdt = 150 - i * 8
            p.append(f'<rect x="{cx-wdt//2}" y="{yt-46}" width="{wdt}" height="42" rx="8" '
                     f'fill="url(#metal)" opacity=".9"/>')
            p.append(f'<rect x="{cx-wdt//2}" y="{yb+4}" width="{wdt}" height="42" rx="8" '
                     f'fill="url(#metal)" opacity=".9"/>')
    # crown
    p.append(f'<rect x="{cx+r-4}" y="{cy-19}" width="30" height="38" rx="7" fill="url(#metal)"/>')
    # case + bezel
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#metal)"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r-16}" fill="#0C0C0C"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r-26}" fill="none" stroke="url(#metal)" stroke-width="3"/>')
    # markers
    for i in range(12):
        ang = math.radians(i * 30)
        x1 = cx + math.sin(ang) * (r - 40); y1 = cy - math.cos(ang) * (r - 40)
        x2 = cx + math.sin(ang) * (r - 62); y2 = cy - math.cos(ang) * (r - 62)
        wgt = 6 if i % 3 == 0 else 3
        p.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                 f'stroke="url(#metal)" stroke-width="{wgt}" stroke-linecap="round"/>')
    # subdials
    for dx, dy in ((-62, 0), (62, 0), (0, 64)):
        p.append(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="34" fill="none" '
                 f'stroke="url(#metal)" stroke-opacity=".55" stroke-width="2"/>')
    # hands
    hh = rng.uniform(0.6, 2.2); mm = rng.uniform(2.6, 5.4)
    for length, ang, wdt in ((r - 78, hh / 12 * 360, 9), (r - 48, mm / 12 * 360, 6)):
        a = math.radians(ang)
        p.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+math.sin(a)*length:.1f}" '
                 f'y2="{cy-math.cos(a)*length:.1f}" stroke="url(#metal)" '
                 f'stroke-width="{wdt}" stroke-linecap="round"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="9" fill="url(#metal)"/>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r-16}" fill="url(#glass)"/>')
    return "".join(p), cy


def gem(cx, cy, size, tone="#EAF2FF"):
    s = size
    return (f'<g><path d="M{cx-s} {cy-s*0.36} L{cx-s*0.5} {cy-s*0.78} L{cx+s*0.5} {cy-s*0.78} '
            f'L{cx+s} {cy-s*0.36} L{cx} {cy+s} Z" fill="url(#metal)" opacity=".92"/>'
            f'<path d="M{cx-s} {cy-s*0.36} L{cx+s} {cy-s*0.36} L{cx} {cy+s} Z" '
            f'fill="{tone}" opacity=".30"/>'
            f'<path d="M{cx-s*0.5} {cy-s*0.78} L{cx-s*0.36} {cy-s*0.36} L{cx+s*0.36} {cy-s*0.36} '
            f'L{cx+s*0.5} {cy-s*0.78} Z" fill="{tone}" opacity=".45"/>'
            f'<path d="M{cx-s*0.36} {cy-s*0.36} L{cx} {cy+s} L{cx+s*0.36} {cy-s*0.36} Z" '
            f'fill="#FFFFFF" opacity=".18"/></g>')


def ring(rng, stone=None, halo=False):
    cx, cy = 400, 520
    R, r = 190, 148
    p = [f'<ellipse cx="{cx}" cy="{cy}" rx="{R}" ry="{R*0.98:.0f}" fill="url(#metal)"/>',
         f'<ellipse cx="{cx}" cy="{cy+6}" rx="{r}" ry="{r*0.98:.0f}" fill="#0B0B0B"/>',
         f'<ellipse cx="{cx}" cy="{cy}" rx="{R-4}" ry="{R*0.98-4:.0f}" fill="none" '
         f'stroke="#000" stroke-opacity=".35" stroke-width="2"/>']
    if stone:
        top = cy - R
        p.append(f'<path d="M{cx-52} {top+26} Q{cx} {top-6} {cx+52} {top+26}" fill="none" '
                 f'stroke="url(#metal)" stroke-width="16" stroke-linecap="round"/>')
        if halo:
            for i in range(12):
                a = math.radians(i * 30)
                p.append(f'<circle cx="{cx+math.cos(a)*62:.1f}" cy="{top-34+math.sin(a)*62:.1f}" '
                         f'r="11" fill="#EAF2FF" opacity=".55"/>')
        p.append(gem(cx, top - 44, 54, stone))
    else:
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{(R+r)//2}" ry="{(R+r)//2*0.98:.0f}" '
                 f'fill="none" stroke="#FFF" stroke-opacity=".10" stroke-width="10"/>')
    return "".join(p), cy


def necklace(rng, pendant="gem", tone="#EAF2FF"):
    cx = 400
    p = [f'<path d="M170 190 Q400 {760} 630 190" fill="none" stroke="url(#metal)" '
         f'stroke-width="11" stroke-linecap="round"/>']
    n = 26
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * 170 + 2 * (1 - t) * t * 400 + t ** 2 * 630
        y = (1 - t) ** 2 * 190 + 2 * (1 - t) * t * 760 + t ** 2 * 190
        p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="url(#metal)" opacity=".95"/>')
    by = 476
    if pendant == "gem":
        p.append(f'<circle cx="{cx}" cy="{by+18}" r="14" fill="none" stroke="url(#metal)" stroke-width="6"/>')
        p.append(gem(cx, by + 66, 62, tone))
    elif pendant == "pearl":
        for i, (dx, rr) in enumerate(((0, 46), (-96, 34), (96, 34))):
            p.append(f'<circle cx="{cx+dx}" cy="{by+40 - abs(dx)*0.22:.0f}" r="{rr}" fill="url(#metalv)"/>')
            p.append(f'<circle cx="{cx+dx-rr*0.3:.0f}" cy="{by+22-abs(dx)*0.22:.0f}" r="{rr*0.28:.0f}" '
                     f'fill="#FFF" opacity=".35"/>')
    elif pendant == "cross":
        p.append(f'<rect x="{cx-16}" y="{by}" width="32" height="150" rx="6" fill="url(#metal)"/>')
        p.append(f'<rect x="{cx-64}" y="{by+42}" width="128" height="32" rx="6" fill="url(#metal)"/>')
    else:  # plain chain
        p.append(f'<circle cx="{cx}" cy="{by+14}" r="16" fill="none" stroke="url(#metal)" stroke-width="7"/>')
    return "".join(p), 470


def bracelet(rng, style="link", tone="#EAF2FF"):
    cx, cy = 400, 500
    rx, ry = 250, 176
    p = []
    if style == "tennis":
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
                 f'stroke="url(#metal)" stroke-width="16"/>')
        for i in range(30):
            a = math.radians(i * 12)
            x = cx + math.cos(a) * rx; y = cy + math.sin(a) * ry
            p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="{tone}" opacity=".75"/>')
            p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="none" stroke="url(#metal)" stroke-width="3"/>')
    elif style == "bangle":
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
                 f'stroke="url(#metal)" stroke-width="34"/>')
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
                 f'stroke="#FFF" stroke-opacity=".12" stroke-width="8"/>')
    elif style == "leather":
        p.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
                 f'stroke="url(#metalv)" stroke-width="40"/>')
        for i in range(40):
            a = math.radians(i * 9)
            x = cx + math.cos(a) * (rx - 13); y = cy + math.sin(a) * (ry - 9)
            p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="#000" opacity=".45"/>')
    else:  # cuban link
        for i in range(26):
            a = math.radians(i * 13.85)
            x = cx + math.cos(a) * rx; y = cy + math.sin(a) * ry
            rot = math.degrees(a) + 90
            p.append(f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot:.1f})">'
                     f'<rect x="-21" y="-15" width="42" height="30" rx="13" fill="none" '
                     f'stroke="url(#metal)" stroke-width="11"/></g>')
    return "".join(p), cy


def earrings(rng, style="stud", tone="#EAF2FF"):
    p = []
    for cx in (270, 530):
        if style == "hoop":
            p.append(f'<circle cx="{cx}" cy="520" r="124" fill="none" stroke="url(#metal)" stroke-width="22"/>')
            p.append(f'<circle cx="{cx}" cy="520" r="124" fill="none" stroke="#FFF" '
                     f'stroke-opacity=".12" stroke-width="6"/>')
        elif style == "drop":
            p.append(f'<path d="M{cx} 330 L{cx} 430" stroke="url(#metal)" stroke-width="7"/>')
            p.append(f'<circle cx="{cx}" cy="320" r="26" fill="none" stroke="url(#metal)" stroke-width="8"/>')
            p.append(gem(cx, 500, 74, tone))
        elif style == "pearl":
            p.append(f'<circle cx="{cx}" cy="410" r="20" fill="none" stroke="url(#metal)" stroke-width="7"/>')
            p.append(f'<circle cx="{cx}" cy="520" r="74" fill="url(#metalv)"/>')
            p.append(f'<circle cx="{cx-24}" cy="496" r="20" fill="#FFF" opacity=".32"/>')
        else:  # stud
            for i in range(6):
                a = math.radians(i * 60)
                p.append(f'<circle cx="{cx+math.cos(a)*66:.1f}" cy="{520+math.sin(a)*66:.1f}" '
                         f'r="17" fill="url(#metal)"/>')
            p.append(gem(cx, 510, 62, tone))
    return "".join(p), 500


def accessory(rng, style="box"):
    cx, cy = 400, 500
    p = []
    if style == "box":
        p.append(f'<path d="M180 420 L400 320 L620 420 L400 522 Z" fill="url(#metal)" opacity=".9"/>')
        p.append(f'<path d="M180 420 L180 640 L400 742 L400 522 Z" fill="url(#metalv)" opacity=".55"/>')
        p.append(f'<path d="M620 420 L620 640 L400 742 L400 522 Z" fill="#0E0E0E"/>')
        p.append(f'<path d="M620 420 L620 640 L400 742 L400 522 Z" fill="url(#metal)" opacity=".28"/>')
        p.append(f'<rect x="382" y="486" width="36" height="26" rx="4" fill="url(#metal)"/>')
        p.append(f'<path d="M180 420 L400 320 L620 420" fill="none" stroke="#FFF" stroke-opacity=".16" stroke-width="2"/>')
    elif style == "roll":
        p.append(f'<rect x="176" y="384" width="448" height="232" rx="116" fill="url(#metalv)"/>')
        p.append(f'<ellipse cx="176" cy="500" rx="58" ry="116" fill="#0D0D0D"/>')
        p.append(f'<ellipse cx="176" cy="500" rx="58" ry="116" fill="url(#metal)" opacity=".35"/>')
        p.append(f'<path d="M400 384 L400 616" stroke="#000" stroke-opacity=".35" stroke-width="10"/>')
        p.append(f'<circle cx="400" cy="500" r="24" fill="url(#metal)"/>')
    elif style == "wallet":
        p.append(f'<rect x="196" y="360" width="408" height="280" rx="18" fill="url(#metalv)"/>')
        p.append(f'<rect x="196" y="490" width="408" height="150" rx="18" fill="#000" opacity=".22"/>')
        p.append(f'<path d="M196 490 L604 490" stroke="url(#metal)" stroke-width="3" stroke-opacity=".7"/>')
        p.append(f'<rect x="352" y="470" width="96" height="42" rx="6" fill="url(#metal)" opacity=".85"/>')
    else:  # case
        p.append(f'<rect x="188" y="330" width="424" height="360" rx="26" fill="url(#metalv)"/>')
        p.append(f'<rect x="188" y="330" width="424" height="360" rx="26" fill="none" '
                 f'stroke="url(#metal)" stroke-width="4"/>')
        p.append(f'<path d="M188 510 L612 510" stroke="url(#metal)" stroke-width="4"/>')
        p.append(f'<rect x="352" y="292" width="96" height="46" rx="14" fill="none" '
                 f'stroke="url(#metal)" stroke-width="9"/>')
        p.append(f'<rect x="368" y="492" width="64" height="36" rx="6" fill="url(#metal)"/>')
    return "".join(p), cy


# --------------------------------------------------------------------- render
def render(slug, category, material, variant, seed, out_dir):
    rng = random.Random(seed)
    metal = MATERIAL_METAL.get(material, "gold")
    if variant.get("stone") == "emerald":
        pass
    if category == "watches":
        body, cy = watch(rng, "leather" if material == "Genuine Leather" else "metal")
    elif category == "rings":
        body, cy = ring(rng, variant.get("stone"), variant.get("halo", False))
    elif category == "necklaces":
        body, cy = necklace(rng, variant.get("pendant", "gem"), variant.get("tone", "#EAF2FF"))
    elif category == "bracelets":
        body, cy = bracelet(rng, variant.get("style", "link"), variant.get("tone", "#EAF2FF"))
    elif category == "earrings":
        body, cy = earrings(rng, variant.get("style", "stud"), variant.get("tone", "#EAF2FF"))
    else:
        body, cy = accessory(rng, variant.get("style", "box"))

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
           f'width="{W}" height="{H}" role="img" aria-label="{slug}">'
           f'{defs(metal, seed)}{frame(metal, seed)}'
           f'<ellipse cx="400" cy="902" rx="236" ry="22" fill="#000" opacity=".45" filter="url(#soft)"/>'
           f'{body}</svg>')
    with open(os.path.join(out_dir, f"{slug}.svg"), "w") as f:
        f.write(svg)


if __name__ == "__main__":
    import sys
    sys.path.insert(0, "/home/claude/tools")
    from catalog import PRODUCTS
    out = os.path.join(ROOT, "products")
    os.makedirs(out, exist_ok=True)
    for i, p in enumerate(PRODUCTS):
        render(p["slug"], p["category"], p["material"], p.get("art", {}), i * 977 + 13, out)
    print(f"rendered {len(PRODUCTS)} product images")
