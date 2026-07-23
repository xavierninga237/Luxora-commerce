# -*- coding: utf-8 -*-
"""Single source of truth for the Luxora catalogue.

Feeds both the SVG render pipeline and the front-end data layer, so the
images, filters, search index and admin inventory can never drift apart.
"""
import random, re, json

BRANDS = [
    ("luxora",   "Luxora",   "The house line. Swiss movements, in-house cases, made in small runs."),
    ("aurelius", "Aurelius", "Roman-inspired goldsmithing, worked by hand in Vicenza."),
    ("novaire",  "Novaire",  "Modern minimalism — clean geometry, no ornament for its own sake."),
    ("velmont",  "Velmont",  "Diamond specialists. Every stone is graded before it is set."),
    ("celestia", "Celestia", "Coloured gemstones sourced through a traceable supply chain."),
    ("ardent",   "Ardent",   "Leather goods and travel pieces, vegetable-tanned in Tuscany."),
    ("kronique", "Kronique", "Complications and skeleton work for collectors."),
    ("elvaro",   "Elvaro",   "Everyday luxury — titanium, steel and carbon composites."),
]

COLLECTIONS = [
    ("heritage",  "Heritage Collection",   "Pieces built on the house's oldest drawings."),
    ("executive", "Executive Collection",  "Restrained forms that read well across a boardroom table."),
    ("wedding",   "Wedding Collection",    "For the day itself, and the fifty years after it."),
    ("signature", "Signature Collection",  "The designs Luxora is known for."),
    ("limited",   "Limited Edition",       "Numbered runs. Once they are gone, they are gone."),
    ("black",     "Black Edition",         "Blackened cases, dark dials, no polish."),
    ("gold",      "Gold Collection",       "18K, white and rose gold throughout."),
    ("diamond",   "Diamond Collection",    "Certified stones, hand-set."),
    ("traveler",  "Traveler Collection",   "Built for time zones and hard-shell cases."),
    ("everyday",  "Everyday Luxury",       "The pieces you never take off."),
]

CATEGORIES = [
    ("watches",     "Watches",     "Mechanical and automatic timepieces."),
    ("rings",       "Rings",       "Bands, signets and solitaires."),
    ("necklaces",   "Necklaces",   "Chains and pendants."),
    ("bracelets",   "Bracelets",   "Links, bangles and tennis settings."),
    ("earrings",    "Earrings",    "Studs, hoops and drops."),
    ("accessories", "Accessories", "Cases, rolls and leather goods."),
]

# name, brand, collection, price, material, colour, hook, art variant, tags
RAW = [
 # ---------------------------------------------------------------- watches
 ("Luxora Chronograph Black","luxora","black",4850,"Titanium","Black",
  "A blackened titanium chronograph with a matte dial that stays legible in direct sun.",
  {},["bestseller","featured"]),
 ("Luxora Chronograph Gold","luxora","gold",7900,"18K Gold","Gold",
  "The same chronograph movement in a solid 18K case, with a warmer, softer dial.",
  {},["bestseller"]),
 ("Luxora Heritage Automatic","luxora","heritage",6200,"Stainless Steel","Silver",
  "Drawn from the 1962 house archive and rebuilt around a modern 72-hour movement.",
  {},["featured","bestseller"]),
 ("Luxora Skeleton Edition","kronique","limited",11800,"18K Gold","Gold",
  "The bridges are cut away by hand so the whole escapement is visible from the front.",
  {},["featured","limited"]),
 ("Luxora Moonphase","kronique","heritage",9400,"White Gold","White",
  "A moonphase accurate to one day in 122 years, set against an aventurine sky.",
  {},["featured"]),
 ("Luxora Elite Diver","elvaro","signature",3300,"Stainless Steel","Blue",
  "Rated to 300 m with a ceramic bezel that will not fade after a season in salt water.",
  {},["bestseller"]),
 ("Luxora Titanium Sport","elvaro","everyday",2450,"Titanium","Black",
  "Grade 5 titanium, 78 grams on the wrist — you stop noticing it by the second day.",
  {},["featured","new"]),
 ("Luxora Classic Leather","luxora","executive",1850,"Genuine Leather","Brown",
  "A 38 mm dress watch on a vegetable-tanned strap that darkens with wear.",
  {},["featured"]),
 ("Luxora GMT Traveler","luxora","traveler",5600,"Stainless Steel","Navy",
  "A second time zone you can set without stopping the movement, for people who land often.",
  {},["featured","bestseller"]),
 ("Luxora Carbon X","elvaro","black",4100,"Carbon Fiber","Black",
  "Forged carbon means no two cases carry the same pattern.",
  {},["new","limited"]),
 ("Novaire Slimline 36","novaire","everyday",1450,"Stainless Steel","Silver",
  "Six millimetres thick. It disappears under a shirt cuff.",
  {},["new"]),
 ("Aurelius Regent Automatic","aurelius","executive",8300,"18K Gold","Gold",
  "A fluted gold bezel and a lacquered dial finished in eleven passes.",
  {},[]),
 ("Kronique Tourbillon Noir","kronique","limited",12000,"Carbon Fiber","Black",
  "A flying tourbillon at six o'clock. Twenty-five pieces worldwide.",
  {},["limited"]),
 ("Elvaro Field 40","elvaro","everyday",450,"Stainless Steel","Green",
  "The entry point to the house — a sapphire crystal and a real automatic movement.",
  {},["new"]),
 # ---------------------------------------------------------------- rings
 ("Black Titanium Ring","elvaro","black",320,"Titanium","Black",
  "A brushed titanium band with a chamfered edge that catches light on the turn.",
  {},["featured","bestseller"]),
 ("Gold Signet Ring","aurelius","heritage",1980,"18K Gold","Gold",
  "A flat-faced signet, left blank so it can be engraved to your own mark.",
  {},[]),
 ("Platinum Band","novaire","wedding",2400,"Platinum","Silver",
  "Four millimetres of solid platinum. The metal that will outlast the marriage certificate.",
  {},["bestseller"]),
 ("Carbon Fiber Ring","elvaro","black",280,"Carbon Fiber","Black",
  "Woven carbon set in a steel channel — light, and effectively scratch-proof.",
  {},["new"]),
 ("Diamond Accent Ring","velmont","diamond",1650,"White Gold","White",
  "Five brilliant-cut stones flush-set so nothing snags on a shirt sleeve.",
  {"stone":"#EAF2FF"},[]),
 ("Solitaire Diamond Ring","velmont","wedding",5900,"Platinum","White",
  "A 1.2 ct centre stone in a six-claw setting that lets light in from underneath.",
  {"stone":"#EAF2FF"},["featured","bestseller"]),
 ("Emerald Halo Ring","celestia","signature",4300,"18K Gold","Green",
  "A Colombian emerald ringed by twelve diamonds to lift its colour.",
  {"stone":"#8FF0C4","halo":True},["featured"]),
 ("Rose Gold Infinity Ring","aurelius","wedding",980,"Rose Gold","Rose Gold",
  "Two bands crossing without a visible join — one continuous piece of gold.",
  {},["bestseller"]),
 ("Sapphire Ring","celestia","signature",3200,"White Gold","Blue",
  "A Ceylon sapphire, unheated, in a low bezel that protects the girdle.",
  {"stone":"#9CC6FF"},[]),
 ("White Gold Eternity Ring","velmont","diamond",4600,"White Gold","White",
  "Diamonds the full way round, so it reads the same from every angle.",
  {"stone":"#EAF2FF","halo":True},["featured"]),
 ("Aurelius Roman Band","aurelius","heritage",1240,"18K Gold","Gold",
  "A milled laurel motif cut into the outer face, based on a Republican coin.",
  {},[]),
 ("Novaire Facet Ring","novaire","everyday",640,"Sterling Silver","Silver",
  "Nine flat facets instead of a round profile. Quietly architectural.",
  {},["new"]),
 # ---------------------------------------------------------------- necklaces
 ("Diamond Pendant","velmont","diamond",3900,"White Gold","White",
  "A single 0.8 ct pendant on a 45 cm chain, with a hidden safety clasp.",
  {"pendant":"gem"},["featured","bestseller"]),
 ("Gold Chain","aurelius","gold",2600,"18K Gold","Gold",
  "A solid — not hollow — 5 mm curb chain. It has weight, and it should.",
  {"pendant":"plain"},["featured","bestseller"]),
 ("White Gold Chain","novaire","everyday",2100,"White Gold","White",
  "The same curb link in white gold, rhodium-finished so it stays cold-toned.",
  {"pendant":"plain"},[]),
 ("Pearl Necklace","celestia","wedding",1800,"Sterling Silver","White",
  "Akoya pearls, hand-knotted between each one so a broken thread costs you nothing.",
  {"pendant":"pearl"},["bestseller"]),
 ("Emerald Pendant","celestia","signature",5200,"18K Gold","Green",
  "An emerald-cut stone hung from a fine gold bail so it sits flat against the skin.",
  {"pendant":"gem","tone":"#8FF0C4"},["featured"]),
 ("Sapphire Pendant","celestia","signature",4400,"White Gold","Blue",
  "A deep-blue sapphire that reads almost black until it moves.",
  {"pendant":"gem","tone":"#9CC6FF"},[]),
 ("Cross Necklace","aurelius","heritage",1450,"18K Gold","Gold",
  "A plain gold cross with softened edges — no stones, no engraving.",
  {"pendant":"cross"},[]),
 ("Luxury Layered Necklace","novaire","signature",2950,"Rose Gold","Rose Gold",
  "Three chains at three lengths, joined at a single clasp so they never tangle.",
  {"pendant":"plain"},["new"]),
 ("Velmont Rivière Necklace","velmont","diamond",8500,"Platinum","White",
  "Thirty-two graduated diamonds in a continuous line. The full evening piece.",
  {"pendant":"gem"},["limited"]),
 ("Novaire Bar Pendant","novaire","everyday",340,"Sterling Silver","Silver",
  "A polished silver bar on a fine box chain. The gift you can buy without asking.",
  {"pendant":"plain"},["new"]),
 # ---------------------------------------------------------------- bracelets
 ("Cuban Link Bracelet","aurelius","gold",1900,"18K Gold","Gold",
  "A tight Cuban link that lies flat instead of rolling on the wrist.",
  {"style":"link"},["featured","bestseller"]),
 ("Diamond Tennis Bracelet","velmont","diamond",4900,"White Gold","White",
  "Fifty-six stones in a flexible line setting, with a double-locking clasp.",
  {"style":"tennis"},["featured","bestseller"]),
 ("Gold Bangle","aurelius","gold",1450,"18K Gold","Gold",
  "A hinged bangle — it opens rather than needing to be forced over the hand.",
  {"style":"bangle"},[]),
 ("Leather Bracelet","ardent","everyday",180,"Genuine Leather","Brown",
  "Braided Tuscan leather with a steel clasp. It softens within a fortnight.",
  {"style":"leather"},["new"]),
 ("Silver Chain Bracelet","novaire","everyday",380,"Sterling Silver","Silver",
  "A lighter link for wearing alongside a watch without the two fighting.",
  {"style":"link"},[]),
 ("Black Titanium Bracelet","elvaro","black",420,"Titanium","Black",
  "Matte black links that hide scratches instead of showing every one.",
  {"style":"link"},["new"]),
 ("Charm Bracelet","celestia","signature",890,"Sterling Silver","Silver",
  "An open-link bracelet built to be added to over years.",
  {"style":"bangle"},[]),
 ("Pearl Bracelet","celestia","wedding",760,"Sterling Silver","White",
  "A single strand of 6 mm Akoya pearls on a silver box clasp.",
  {"style":"tennis","tone":"#FFFDF8"},[]),
 ("Elvaro Carbon Cuff","elvaro","black",520,"Carbon Fiber","Black",
  "A rigid carbon cuff with a titanium hinge. Nineteen grams.",
  {"style":"bangle"},["new"]),
 # ---------------------------------------------------------------- earrings
 ("Diamond Stud Earrings","velmont","diamond",2900,"White Gold","White",
  "A matched 0.5 ct pair, graded together so they read identically.",
  {"style":"stud"},["featured","bestseller"]),
 ("Pearl Earrings","celestia","wedding",680,"Sterling Silver","White",
  "8 mm Akoya pearls on silver posts with a locking back.",
  {"style":"pearl"},[]),
 ("Gold Hoops","aurelius","gold",1150,"18K Gold","Gold",
  "A 30 mm hoop in solid gold, weighted at the base so it hangs true.",
  {"style":"hoop"},["bestseller"]),
 ("White Gold Hoops","novaire","everyday",1050,"White Gold","White",
  "The same profile in white gold, for people who never wear yellow.",
  {"style":"hoop"},["featured"]),
 ("Emerald Earrings","celestia","signature",5100,"18K Gold","Green",
  "Two emeralds cut from the same rough, so the colour matches exactly.",
  {"style":"drop","tone":"#8FF0C4"},[]),
 ("Sapphire Earrings","celestia","signature",4200,"White Gold","Blue",
  "Oval sapphires suspended from a diamond-set link.",
  {"style":"drop","tone":"#9CC6FF"},[]),
 ("Rose Gold Drops","aurelius","signature",1350,"Rose Gold","Rose Gold",
  "A tapered rose gold teardrop that catches light as you turn your head.",
  {"style":"drop"},["new"]),
 ("Luxury Diamond Drops","velmont","diamond",7400,"Platinum","White",
  "Articulated drops that move independently — the reason they read as expensive.",
  {"style":"drop"},["limited"]),
 ("Novaire Bar Studs","novaire","everyday",250,"Sterling Silver","Silver",
  "A 12 mm polished bar. The most-worn piece in the collection.",
  {"style":"stud"},["new"]),
 # ---------------------------------------------------------------- accessories
 ("Premium Watch Box","ardent","heritage",380,"Genuine Leather","Brown",
  "Six watch cushions in a leather case with a soft-close lid and a real lock.",
  {"style":"box"},["featured","bestseller"]),
 ("Leather Watch Roll","ardent","traveler",220,"Genuine Leather","Brown",
  "Three padded slots that roll into a tube — for the carry-on, not the dresser.",
  {"style":"roll"},["bestseller"]),
 ("Jewelry Organizer","ardent","everyday",180,"Genuine Leather","Black",
  "Ring rolls, a necklace bar and two zipped compartments in one tray.",
  {"style":"case"},[]),
 ("Luxury Travel Case","ardent","traveler",650,"Genuine Leather","Navy",
  "A hard-shell case lined in suede, sized to fit under an airline seat.",
  {"style":"case"},["featured"]),
 ("Watch Cleaning Kit","ardent","everyday",80,"Stainless Steel","Silver",
  "A brass brush, two cloths and a bracelet pin tool in a canvas fold.",
  {"style":"roll"},[]),
 ("Leather Wallet","ardent","executive",240,"Genuine Leather","Black",
  "Eight card slots, no coin pocket, edge-painted by hand.",
  {"style":"wallet"},["bestseller"]),
 ("Passport Holder","ardent","traveler",160,"Genuine Leather","Navy",
  "Holds a passport, two cards and a boarding pass. Nothing else fits, by design.",
  {"style":"wallet"},["new"]),
 ("Key Holder","ardent","everyday",95,"Genuine Leather","Brown",
  "A folded leather sleeve with six posts, so keys stop shredding your pocket lining.",
  {"style":"wallet"},[]),
 ("Ardent Document Folio","ardent","executive",420,"Genuine Leather","Black",
  "A slim A4 folio with a pen loop and a single interior pocket.",
  {"style":"case"},["new"]),
 ("Ardent Watch Winder","ardent","heritage",560,"Genuine Leather","Black",
  "A single-rotor winder, quiet enough to sit on a bedside table.",
  {"style":"box"},[]),
]

CATEGORY_OF = {}
for n, *_ in RAW:
    pass

SIZES = {
    "watches": ("Case 40 mm × 11.2 mm", "Lug width 20 mm"),
    "rings": ("Band width 4 mm", "Sizes 48–66"),
    "necklaces": ("Chain 45 cm", "Adjustable to 50 cm"),
    "bracelets": ("Length 19 cm", "Adjustable ±1.5 cm"),
    "earrings": ("Drop 22 mm", "Post 11 mm"),
    "accessories": ("240 × 160 × 90 mm", "1.1 kg"),
}
WEIGHTS = {"watches": (78, 165), "rings": (3, 12), "necklaces": (12, 46),
           "bracelets": (14, 62), "earrings": (2, 9), "accessories": (120, 1400)}


def category_for(index):
    if index < 14: return "watches"
    if index < 26: return "rings"
    if index < 36: return "necklaces"
    if index < 45: return "bracelets"
    if index < 54: return "earrings"
    return "accessories"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


CARE = {
    "watches": "Service every 5 years. Do not operate the crown underwater.",
    "rings": "Remove before manual work. Clean with warm water and a soft brush.",
    "necklaces": "Store flat. Keep away from perfume and chlorine.",
    "bracelets": "Wipe after wear. Have the clasp checked annually.",
    "earrings": "Put on last, take off first. Store in the pouch supplied.",
    "accessories": "Condition leather twice a year. Keep out of direct sun.",
}

PRODUCTS = []
rng = random.Random(20260722)

for i, (name, brand, collection, price, material, color, hook, art, tags) in enumerate(RAW):
    cat = category_for(i)
    slug = slugify(name)
    on_sale = rng.random() < 0.28
    discount = round(price * rng.uniform(0.74, 0.89) / 5) * 5 if on_sale else None
    stock = rng.choice([0, 2, 3, 5, 7, 9, 12, 18, 24, 31, 44, 58, 76])
    rating = round(rng.uniform(4.2, 5.0), 1)
    reviews = rng.randint(11, 486)
    wl, wh = WEIGHTS[cat]
    dim, dim2 = SIZES[cat]
    brand_name = dict((b[0], b[1]) for b in BRANDS)[brand]
    short = hook
    long_desc = (
        f"{hook} "
        f"Made by {brand_name} in {material.lower()}, finished by hand and inspected twice before it leaves the workshop. "
        f"Supplied in Luxora packaging with a stamped certificate and a two-year international warranty."
    )
    PRODUCTS.append({
        "id": f"LX-{1000+i}",
        "sku": f"{cat[:3].upper()}-{brand[:2].upper()}-{1000+i}",
        "slug": slug,
        "name": name,
        "brand": brand,
        "brandName": brand_name,
        "category": cat,
        "collection": collection,
        "shortDescription": short,
        "description": long_desc,
        "care": CARE[cat],
        "price": price,
        "discountPrice": discount,
        "stock": stock,
        "material": material,
        "color": color,
        "weight": f"{rng.randint(wl, wh)} g",
        "dimensions": dim,
        "dimensions2": dim2,
        "images": [f"assets/images/products/{slug}.svg"],
        "rating": rating,
        "reviewCount": reviews,
        "shippingTime": rng.choice(["1–2 business days", "2–4 business days", "3–5 business days"]),
        "warranty": "2-year international warranty",
        "returnPolicy": "30-day returns, free of charge",
        "featured": "featured" in tags,
        "newArrival": "new" in tags,
        "bestseller": "bestseller" in tags,
        "limitedEdition": "limited" in tags,
        "art": art,
    })

if __name__ == "__main__":
    print(len(PRODUCTS), "products")
    print(json.dumps(PRODUCTS[0], indent=2)[:700])
