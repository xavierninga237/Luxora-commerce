"""Export the catalogue and mock commerce records into the front-end data layer."""
import json, random, sys, datetime, os
sys.path.insert(0, "/home/claude/tools")
from catalog import PRODUCTS, BRANDS, COLLECTIONS, CATEGORIES

OUT_JS = "/home/claude/luxora-commerce/assets/js/data"
OUT_JSON = "/home/claude/luxora-commerce/data"
os.makedirs(OUT_JS, exist_ok=True)
os.makedirs(OUT_JSON, exist_ok=True)
rng = random.Random(4242)

products = []
for p in PRODUCTS:
    q = {k: v for k, v in p.items() if k != "art"}
    products.append(q)

MATERIALS = sorted({p["material"] for p in products})
COLORS = sorted({p["color"] for p in products})

FIRST = ["Marcus", "Elena", "Jonathan", "Priya", "Tomas", "Aisha", "Daniel", "Sofia",
         "Henrik", "Lucia", "Omar", "Charlotte", "Andre", "Mei", "Rafael", "Nadia",
         "Julian", "Isabelle", "Viktor", "Amara"]
LAST = ["Reyes", "Novak", "Whitfield", "Sharma", "Lindqvist", "Bello", "Kaufman",
        "Moretti", "Dahl", "Ferreira", "Haddad", "Ashcroft", "Laurent", "Chen",
        "Duarte", "Osei", "Brandt", "Rousseau", "Petrov", "Nakamura"]
CITIES = [("New York", "US"), ("London", "UK"), ("Zurich", "CH"), ("Dubai", "AE"),
          ("Singapore", "SG"), ("Paris", "FR"), ("Milan", "IT"), ("Toronto", "CA"),
          ("Munich", "DE"), ("Stockholm", "SE"), ("Tokyo", "JP"), ("Sydney", "AU")]

customers = []
for i in range(48):
    f, l = rng.choice(FIRST), rng.choice(LAST)
    city, cc = rng.choice(CITIES)
    joined = datetime.date(2024, 1, 1) + datetime.timedelta(days=rng.randint(0, 900))
    customers.append({
        "id": f"CU-{2100+i}",
        "name": f"{f} {l}",
        "email": f"{f.lower()}.{l.lower()}@example.com",
        "city": city, "country": cc,
        "joined": joined.isoformat(),
        "orders": rng.randint(1, 14),
        "spent": rng.randint(320, 48000),
        "tier": rng.choice(["Member", "Member", "Circle", "Circle", "Private Client"]),
        "initials": (f[0] + l[0]),
    })

STATUS = ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"]
STATUS_W = [6, 10, 12, 14, 46, 6, 3]

orders = []
for i in range(140):
    cust = rng.choice(customers)
    n = rng.randint(1, 3)
    items = []
    for _ in range(n):
        p = rng.choice(products)
        qty = rng.choice([1, 1, 1, 2])
        unit = p["discountPrice"] or p["price"]
        items.append({"sku": p["sku"], "slug": p["slug"], "name": p["name"],
                      "qty": qty, "unit": unit, "image": p["images"][0]})
    sub = sum(i2["qty"] * i2["unit"] for i2 in items)
    ship = 0 if sub > 500 else 35
    tax = round(sub * 0.08)
    placed = datetime.date(2026, 7, 22) - datetime.timedelta(days=rng.randint(0, 179))
    orders.append({
        "id": f"LX-ORD-{10450+i}",
        "customerId": cust["id"], "customer": cust["name"], "email": cust["email"],
        "city": cust["city"], "country": cust["country"],
        "date": placed.isoformat(),
        "status": rng.choices(STATUS, STATUS_W)[0],
        "items": items, "subtotal": sub, "shipping": ship, "tax": tax,
        "total": sub + ship + tax,
        "payment": rng.choice(["Visa •••• 4242", "Mastercard •••• 8813", "Amex •••• 1005",
                               "PayPal", "Apple Pay", "Google Pay"]),
        "tracking": f"LXW{rng.randint(10**8, 10**9-1)}",
    })
orders.sort(key=lambda o: o["date"], reverse=True)

TITLES = ["Better in person", "Exactly as described", "Worth the wait", "My third Luxora piece",
          "Gift that landed well", "Quiet and well made", "Small complaint, still five stars",
          "Bought for our anniversary", "Wears beautifully", "Packaging alone is worth it"]
BODIES = [
    "Photos do not do the finishing justice — the edge bevel catches light in a way that reads much more expensive than the price.",
    "Ordered on a Tuesday, wore it Friday. Sizing was accurate and the certificate was in the box.",
    "I have worn this daily for four months and it still looks new. No plating wear at the clasp.",
    "The clasp took a couple of days to get used to, but it is secure and I have stopped thinking about it.",
    "Bought as a wedding gift. The packaging did half the work for me — she assumed it cost twice what it did.",
    "Support answered in under an hour when I asked about resizing, and covered the return postage.",
    "Slightly heavier than I expected, which I have come to like. It feels like an object rather than an accessory.",
    "Third piece from this house. Consistent quality, consistent finishing, no surprises.",
]
reviews = []
for p in products:
    for j in range(rng.randint(2, 6)):
        c = rng.choice(customers)
        d = datetime.date(2026, 7, 22) - datetime.timedelta(days=rng.randint(2, 400))
        reviews.append({
            "id": f"RV-{len(reviews)+3000}",
            "slug": p["slug"], "product": p["name"],
            "author": c["name"], "initials": c["initials"],
            "rating": rng.choices([5, 4, 3, 2], [64, 24, 9, 3])[0],
            "title": rng.choice(TITLES), "body": rng.choice(BODIES),
            "date": d.isoformat(), "verified": rng.random() < 0.86,
            "helpful": rng.randint(0, 74), "photos": rng.random() < 0.3,
            "status": rng.choices(["Published", "Pending", "Flagged"], [86, 10, 4])[0],
        })

coupons = [
    {"code": "CIRCLE10", "type": "percent", "value": 10, "minSpend": 0, "uses": 412, "limit": 2000,
     "expires": "2026-12-31", "status": "Active", "description": "10% off for newsletter subscribers"},
    {"code": "WELCOME50", "type": "fixed", "value": 50, "minSpend": 400, "uses": 188, "limit": 500,
     "expires": "2026-10-01", "status": "Active", "description": "$50 off a first order over $400"},
    {"code": "FREESHIP", "type": "shipping", "value": 0, "minSpend": 200, "uses": 963, "limit": 5000,
     "expires": "2026-12-31", "status": "Active", "description": "Free express shipping over $200"},
    {"code": "HERITAGE15", "type": "percent", "value": 15, "minSpend": 1500, "uses": 74, "limit": 300,
     "expires": "2026-09-15", "status": "Active", "description": "15% off the Heritage Collection"},
    {"code": "VAULT25", "type": "percent", "value": 25, "minSpend": 5000, "uses": 21, "limit": 50,
     "expires": "2026-08-31", "status": "Paused", "description": "Private client offer"},
    {"code": "SPRING24", "type": "percent", "value": 12, "minSpend": 0, "uses": 1104, "limit": 1104,
     "expires": "2026-04-30", "status": "Expired", "description": "Spring campaign, closed"},
]

months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"]
revenue_series = [286400, 312800, 298700, 361200, 402900, 448600]
orders_series = [412, 448, 431, 502, 561, 618]
visitor_series = [41200, 46800, 44100, 52600, 58900, 64300]
analytics = {
    "months": months,
    "revenue": revenue_series,
    "orders": orders_series,
    "visitors": visitor_series,
    "conversionRate": [2.1, 2.3, 2.2, 2.5, 2.7, 2.9],
    "aov": [695, 698, 693, 719, 718, 726],
    "channels": [["Direct", 34], ["Organic search", 28], ["Paid social", 19],
                 ["Email", 12], ["Referral", 7]],
    "devices": [["Mobile", 58], ["Desktop", 36], ["Tablet", 6]],
    "regions": [["North America", 41], ["Europe", 33], ["Middle East", 14],
                ["Asia Pacific", 9], ["Rest of world", 3]],
    "aiUsage": [1840, 2210, 2090, 2760, 3180, 3610],
}

testimonials = [
    {"name": "Marcus Reyes", "role": "Private client, New York", "initials": "AR", "rating": 5,
     "quote": "I have bought from the big houses on Fifth Avenue. The finishing here is the same; the buying experience is better, because nobody made me wait for a seat."},
    {"name": "Elena Novak", "role": "Circle member, Zurich", "initials": "EN", "rating": 5,
     "quote": "The gift finder asked four questions and put the right piece in front of me. I had been scrolling for three weeks before that."},
    {"name": "Jonathan Dale", "role": "Collector, London", "initials": "JD", "rating": 5,
     "quote": "Six pieces over two years, one resize, one warranty claim. Both handled without an argument. That is the whole review."},
    {"name": "Sofia Laurent", "role": "Private client, Paris", "initials": "SL", "rating": 5,
     "quote": "The review summary told me in one paragraph what two hundred reviews would have told me in an hour."},
    {"name": "Mei Kaufman", "role": "Circle member, Singapore", "initials": "MK", "rating": 5,
     "quote": "It arrived in three days in Singapore, in packaging I kept. The certificate was signed, not printed."},
    {"name": "Tomas Petrov", "role": "Collector, Munich", "initials": "TP", "rating": 4,
     "quote": "The strap I ordered was on backorder and they told me before I asked. I would rather have that than a fake ship date."},
]

journal = [
    {"slug": "reading-a-movement", "title": "How to read a movement through a display back",
     "excerpt": "Bridges, jewels, the balance wheel — what you are actually looking at, and what tells you the watch was finished by hand.",
     "date": "2026-06-18", "read": "6 min", "image": "assets/images/collections/heritage.svg"},
    {"slug": "four-cs-plainly", "title": "The four Cs, explained without the sales pitch",
     "excerpt": "Cut does most of the work. Here is how much the other three are really worth to you.",
     "date": "2026-05-30", "read": "8 min", "image": "assets/images/collections/diamond.svg"},
    {"slug": "gold-that-lasts", "title": "Why 18K outlives 9K, and when it does not matter",
     "excerpt": "Alloy percentages, plating wear, and the one case where the cheaper metal is the right answer.",
     "date": "2026-05-02", "read": "5 min", "image": "assets/images/collections/gold.svg"},
]

DATA = {
    "meta": {"brand": "Luxora Commerce", "tagline": "Timeless Luxury. Delivered Worldwide.",
             "currency": "USD", "generated": "2026-07-22"},
    "categories": [{"slug": s, "name": n, "blurb": b,
                    "image": f"assets/images/collections/cat-{s}.svg"} for s, n, b in CATEGORIES],
    "collections": [{"slug": s, "name": n, "blurb": b,
                     "image": f"assets/images/collections/{s}.svg"} for s, n, b in COLLECTIONS],
    "brands": [{"slug": s, "name": n, "blurb": b,
                "logo": f"assets/images/brands/{s}.svg"} for s, n, b in BRANDS],
    "materials": MATERIALS,
    "colors": COLORS,
    "products": products,
    "reviews": reviews,
    "customers": customers,
    "orders": orders,
    "coupons": coupons,
    "analytics": analytics,
    "testimonials": testimonials,
    "journal": journal,
}

with open(f"{OUT_JSON}/luxora.json", "w") as f:
    json.dump(DATA, f, indent=1)

for key in ("products", "reviews", "orders", "customers"):
    with open(f"{OUT_JSON}/{key}.json", "w") as f:
        json.dump(DATA[key], f, indent=1)

js = ("/* Luxora Commerce — generated data layer. Do not edit by hand;\n"
      "   regenerate with tools/export_data.py. */\n"
      "window.LUXORA = " + json.dumps(DATA, separators=(",", ":")) + ";\n")
with open(f"{OUT_JS}/luxora-data.js", "w") as f:
    f.write(js)

print(f"products={len(products)} reviews={len(reviews)} orders={len(orders)} "
      f"customers={len(customers)}  js={os.path.getsize(OUT_JS+'/luxora-data.js')/1024:.0f} KB")
