"""Generate the admin platform pages."""
import sys
sys.path.insert(0, "/home/claude/tools")
from build_pages_1 import head, FONTS

REL = "../"
ROOT = "/home/claude/luxora-commerce"


def admin_scripts():
    order = ["core/utils", "core/store", "core/ui", "features/ai", "features/admin"]
    tags = ['<script src="%sassets/js/data/luxora-data.js"></script>' % REL]
    tags += ['<script src="%sassets/js/%s.js"></script>' % (REL, m) for m in order]
    return "\n".join(tags)


NAV = [
    ("Overview", [
        ("dashboard", "Dashboard", "grid"),
        ("analytics", "Analytics", "chart"),
    ]),
    ("Catalogue", [
        ("products", "Products", "box"),
        ("inventory", "Inventory", "tag"),
        ("reviews", "Reviews", "star"),
        ("coupons", "Coupons", "tag"),
    ]),
    ("Commerce", [
        ("orders", "Orders", "box"),
        ("customers", "Customers", "users"),
    ]),
    ("Intelligence", [
        ("ai", "AI Conversations", "spark"),
        ("settings", "Settings", "gear"),
    ]),
]


def sidebar(active):
    groups = ""
    for title, links in NAV:
        groups += "<h6>%s</h6>" % title
        for slug, label, ic in links:
            cls = " is-on" if slug == active else ""
            tag = '<span class="tag">AI</span>' if slug == "ai" else ""
            groups += ('<a href="%sadmin/%s.html" class="%s" data-ic="%s">%s%s</a>'
                       % (REL, slug, cls.strip(), ic, label, tag))
    return '''
<aside class="admin__side">
  <div class="admin__brand"><img src="RELassets/images/logos/luxora-mark.png" alt="">
    <div><b>LUXORA</b><span>Admin</span></div></div>
  <nav class="admin__nav">GROUPS</nav>
  <div class="admin__user"><div class="avatar" style="width:36px;height:36px">AR</div>
    <div><b>Admin</b><span>Owner</span></div></div>
</aside>
'''.replace("REL", REL).replace("GROUPS", groups)


def admin_page(title, active, heading, inner, extra_js=""):
    css = ["tokens", "base", "components", "layout", "pages", "admin"]
    links = "".join('<link rel="stylesheet" href="%sassets/css/%s.css">' % (REL, c) for c in css)
    return f'''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title><meta name="description" content="Luxora admin">
<link rel="icon" href="{REL}assets/images/logos/favicon.ico">
{FONTS}
{links}
</head>
<body>
<div class="admin">
{sidebar(active)}
<div class="admin__main">
  <header class="admin__top">
    <button class="icon-btn admin__burger" id="admin-burger" aria-label="Menu">&#9776;</button>
    <h1>{heading}</h1>
    <div class="admin__search"><input class="input" placeholder="Search…" aria-label="Search"></div>
    <a class="btn btn--ghost btn--sm" href="{REL}index.html">View store &rarr;</a>
  </header>
  <div class="admin__body">
{inner}
  </div>
</div>
</div>
{admin_scripts()}
<script>
document.addEventListener("DOMContentLoaded",function(){{
  document.querySelectorAll(".admin__nav a[data-ic]").forEach(function(a){{
    if(!a.querySelector("svg")) a.insertAdjacentHTML("afterbegin", window.LX.icon(a.getAttribute("data-ic"),16));
  }});
}});
</script>
{extra_js}
</body></html>'''


def write(path, html):
    import os
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w").write(html)


# ------------------------------------------------------------- dashboard
DASH = '''
<section id="admin-overview">
  <div class="kpis" id="admin-kpis"></div>
  <div class="admin-grid">
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Revenue</h3><span class="panel__sub">Last six months</span></div>
      <span class="badge">USD</span></div><div id="chart-revenue"></div></div>
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Traffic by channel</h3><span class="panel__sub">This month</span></div></div>
      <div style="display:grid;place-items:center" id="chart-channels"></div>
      <div class="legend" id="legend-channels"></div></div>
  </div>
  <div class="admin-grid">
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Orders</h3><span class="panel__sub">Monthly volume</span></div></div><div id="chart-orders"></div></div>
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Revenue by region</h3></div></div><div id="chart-regions" style="margin-top:1rem"></div></div>
  </div>
  <div class="admin-grid">
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Recent orders</h3></div>
      <a class="btn btn--ghost btn--sm" href="RELadmin/orders.html">All orders</a></div>
      <div class="table-wrap" style="border:0"><table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
      <tbody id="admin-recent-orders"></tbody></table></div></div>
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Top products</h3><span class="panel__sub">By revenue</span></div></div>
      <div id="admin-top-products" style="margin-top:.5rem"></div></div>
  </div>
</section>
'''.replace("REL", REL)
write("admin/dashboard.html", admin_page("Dashboard — Luxora Admin", "dashboard", "Dashboard", DASH))

# -------------------------------------------------------------- analytics
ANALYTICS = '''
<section id="admin-overview">
  <div class="kpis" id="admin-kpis"></div>
  <div class="panel" style="margin-bottom:1.25rem"><div class="panel__head"><div><h3 class="panel__title">Revenue trend</h3><span class="panel__sub">Six-month view</span></div></div><div id="chart-revenue"></div></div>
  <div class="admin-grid">
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Order volume</h3></div></div><div id="chart-orders"></div></div>
    <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Channels</h3></div></div>
      <div style="display:grid;place-items:center" id="chart-channels"></div><div class="legend" id="legend-channels"></div></div>
  </div>
  <div class="panel"><div class="panel__head"><div><h3 class="panel__title">Revenue by region</h3></div></div><div id="chart-regions" style="margin-top:1rem"></div></div>
</section>
'''
write("admin/analytics.html", admin_page("Analytics — Luxora Admin", "analytics", "Analytics", ANALYTICS))

# --------------------------------------------------------------- products
PRODUCTS = '''
<div class="toolbar">
  <input class="input" id="admin-products-search" placeholder="Search products…" style="min-width:240px">
  <select class="select" id="admin-products-filter"><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="sale">On sale</option></select>
  <div class="toolbar__spacer"></div>
  <span class="muted" style="font-size:var(--step--2)" id="admin-products-count"></span>
  <button class="btn btn--primary btn--sm" onclick="window.LX.toast('New product','This would open the product editor.')">Add product</button>
</div>
<div class="table-wrap"><table class="table" id="admin-products-table">
  <thead><tr><th class="table__sort" data-sort="name">Product</th><th>Brand</th><th>Category</th>
    <th class="table__sort" data-sort="price">Price</th><th class="table__sort" data-sort="stock">Stock</th>
    <th class="table__sort" data-sort="rating">Rating</th><th>Status</th></tr></thead>
  <tbody></tbody></table></div>
'''
write("admin/products.html", admin_page("Products — Luxora Admin", "products", "Products", PRODUCTS))

# --------------------------------------------------------------- inventory
INVENTORY = '''
<div class="kpis" style="margin-bottom:1.5rem">
  <div class="kpi"><div class="kpi__label">SKUs tracked</div><div class="kpi__value mono" id="inv-total">—</div></div>
  <div class="kpi"><div class="kpi__label">Low stock</div><div class="kpi__value mono" id="inv-low" style="color:#E3B341">—</div></div>
  <div class="kpi"><div class="kpi__label">Out of stock</div><div class="kpi__value mono" id="inv-out" style="color:#FF8A80">—</div></div>
  <div class="kpi"><div class="kpi__label">Stock value</div><div class="kpi__value mono" id="inv-value">—</div></div>
</div>
<div class="toolbar">
  <input class="input" id="admin-products-search" placeholder="Search inventory…" style="min-width:240px">
  <select class="select" id="admin-products-filter"><option value="all">All</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
  <div class="toolbar__spacer"></div><span class="muted" style="font-size:var(--step--2)" id="admin-products-count"></span>
</div>
<div class="table-wrap"><table class="table" id="admin-products-table">
  <thead><tr><th class="table__sort" data-sort="name">Product</th><th>Brand</th><th>Category</th>
    <th class="table__sort" data-sort="price">Price</th><th class="table__sort" data-sort="stock">Stock</th>
    <th class="table__sort" data-sort="rating">Rating</th><th>Status</th></tr></thead>
  <tbody></tbody></table></div>
'''
INV_JS = '''<script>document.addEventListener("DOMContentLoaded",function(){
  var d=window.LUXORA.products, LX=window.LX;
  document.getElementById("inv-total").textContent=d.length;
  document.getElementById("inv-low").textContent=d.filter(function(p){return p.stock>0&&p.stock<=5}).length;
  document.getElementById("inv-out").textContent=d.filter(function(p){return p.stock===0}).length;
  document.getElementById("inv-value").textContent=LX.money(d.reduce(function(n,p){return n+LX.priceOf(p)*p.stock},0));
});</script>'''
write("admin/inventory.html", admin_page("Inventory — Luxora Admin", "inventory", "Inventory", INVENTORY, INV_JS))

# ----------------------------------------------------------------- orders
ORDERS = '''
<div class="toolbar">
  <input class="input" id="admin-orders-search" placeholder="Search orders…" style="min-width:240px">
  <select class="select" id="admin-orders-filter"><option value="all">All statuses</option>
    <option value="pending">Pending</option><option value="paid">Paid</option><option value="processing">Processing</option>
    <option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select>
  <div class="toolbar__spacer"></div><span class="muted" style="font-size:var(--step--2)" id="admin-orders-count"></span>
</div>
<div class="table-wrap"><table class="table" id="admin-orders-table">
  <thead><tr><th>Order</th><th class="table__sort" data-sort="customer">Customer</th>
    <th class="table__sort" data-sort="date">Date</th><th>Items</th><th>Status</th>
    <th class="table__sort" data-sort="total">Total</th></tr></thead>
  <tbody></tbody></table></div>
'''
write("admin/orders.html", admin_page("Orders — Luxora Admin", "orders", "Orders", ORDERS))

# -------------------------------------------------------------- customers
CUSTOMERS = '''
<div class="toolbar">
  <input class="input" id="admin-customers-search" placeholder="Search customers…" style="min-width:240px">
  <select class="select" id="admin-customers-filter"><option value="all">All tiers</option>
    <option value="Member">Member</option><option value="Circle">Circle</option><option value="Private Client">Private Client</option></select>
  <div class="toolbar__spacer"></div><span class="muted" style="font-size:var(--step--2)" id="admin-customers-count"></span>
</div>
<div class="table-wrap"><table class="table" id="admin-customers-table">
  <thead><tr><th class="table__sort" data-sort="name">Customer</th><th>Location</th><th>Tier</th>
    <th class="table__sort" data-sort="orders">Orders</th><th class="table__sort" data-sort="spent">Spent</th><th>Joined</th></tr></thead>
  <tbody></tbody></table></div>
'''
write("admin/customers.html", admin_page("Customers — Luxora Admin", "customers", "Customers", CUSTOMERS))

# ---------------------------------------------------------------- reviews
REVIEWS = '''
<div class="toolbar">
  <input class="input" id="admin-reviews-search" placeholder="Search reviews…" style="min-width:240px">
  <select class="select" id="admin-reviews-filter"><option value="all">All</option>
    <option value="published">Published</option><option value="pending">Pending</option><option value="flagged">Flagged</option></select>
  <div class="toolbar__spacer"></div><span class="muted" style="font-size:var(--step--2)" id="admin-reviews-count"></span>
</div>
<div class="table-wrap"><table class="table" id="admin-reviews-table">
  <thead><tr><th>Product</th><th>Author</th><th class="table__sort" data-sort="rating">Rating</th>
    <th>Title</th><th class="table__sort" data-sort="date">Date</th><th>Status</th></tr></thead>
  <tbody></tbody></table></div>
'''
write("admin/reviews.html", admin_page("Reviews — Luxora Admin", "reviews", "Reviews", REVIEWS))

# ---------------------------------------------------------------- coupons
COUPONS = '''
<div class="toolbar"><div class="toolbar__spacer"></div>
  <button class="btn btn--primary btn--sm" onclick="window.LX.toast('New coupon','This would open the coupon editor.')">New coupon</button></div>
<div class="table-wrap"><table class="table">
  <thead><tr><th>Code</th><th>Description</th><th>Value</th><th>Usage</th><th>Expires</th><th>Status</th></tr></thead>
  <tbody id="admin-coupons-body"></tbody></table></div>
'''
write("admin/coupons.html", admin_page("Coupons — Luxora Admin", "coupons", "Coupons", COUPONS))

# --------------------------------------------------------------------- AI
AI = '''
<div class="panel" style="margin-bottom:1.25rem"><div class="panel__head"><div><h3 class="panel__title">AI concierge usage</h3><span class="panel__sub">Conversations per month</span></div>
  <span class="badge">On-device engine</span></div><div id="chart-ai"></div></div>
<div class="panel"><div class="panel__head"><div><h3 class="panel__title">Recent conversations</h3></div></div>
  <div class="table-wrap" style="border:0"><table class="table">
    <thead><tr><th>Query</th><th>Parsed intent</th><th>Top result</th><th>Response time</th></tr></thead>
    <tbody id="admin-ai-log"></tbody></table></div></div>
'''
write("admin/ai.html", admin_page("AI Conversations — Luxora Admin", "ai", "AI Conversations", AI))

# ---------------------------------------------------------------- settings
SETTINGS = '''
<div class="panel" style="max-width:640px">
  <div class="panel__head"><div><h3 class="panel__title">Store settings</h3></div></div>
  <label class="field"><span class="field__label">Store name</span><input class="input" value="Luxora Commerce"></label>
  <label class="field"><span class="field__label">Support email</span><input class="input" value="care@luxora.example"></label>
  <div class="grid-2">
    <label class="field"><span class="field__label">Currency</span><select class="select"><option>USD</option><option>EUR</option><option>GBP</option><option>CHF</option></select></label>
    <label class="field"><span class="field__label">Free shipping over</span><input class="input mono" value="$500"></label>
  </div>
  <label class="field"><span class="field__label">Tax rate</span><input class="input mono" value="8%"></label>
  <button class="btn btn--primary" onclick="window.LX.toast('Settings saved','Your store settings have been updated.')">Save settings</button>
</div>
'''
write("admin/settings.html", admin_page("Settings — Luxora Admin", "settings", "Settings", SETTINGS))

print("admin pages written")
