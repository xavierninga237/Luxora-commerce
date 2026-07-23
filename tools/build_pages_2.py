"""Generate the core commerce pages."""
import sys
sys.path.insert(0, "/home/claude/tools")
from build_pages_1 import storefront, write

REL = "../"

# ---------------------------------------------------------------------- shop
SHOP = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Shop</div>
  <h1>The collection</h1>
  <p class="lead">Sixty-four pieces across watches, jewelry and accessories. Filter by category, brand, material or price — every filter is shareable in the URL.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="shop">
    <aside class="shop__filters" id="shop-filters" aria-label="Filters"></aside>
    <div>
      <div class="shop__bar">
        <span class="shop__count" id="shop-count"></span>
        <label class="cluster" style="gap:.5rem">
          <span class="muted" style="font-size:var(--step--2);letter-spacing:.08em;text-transform:uppercase">Sort</span>
          <select class="select" id="shop-sort" style="width:auto">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div class="shop__active" id="shop-active"></div>
      <div class="grid grid--3" id="shop-grid"></div>
      <div class="pagination" id="shop-pager"></div>
    </div>
  </div>
</div></section>
'''
write("pages/shop.html", storefront(
    "Shop — Luxora Commerce", "Browse the full Luxora collection of luxury watches and fine jewelry.",
    REL, SHOP.replace("REL", REL), features=["features/catalog"]))

# ------------------------------------------------------------------- product
PRODUCT = '''
<section class="section section--tight"><div class="shell">
  <div class="breadcrumb" id="pdp-crumb"></div>
  <div class="pdp" id="pdp">
    <div class="gallery" id="pdp-gallery"></div>
    <div id="pdp-detail"></div>
  </div>
</div></section>
<section class="section section--deep" id="reviews"><div class="shell shell--tight">
  <div class="section-head"><span class="eyebrow">Verified reviews</span><h2>What owners say</h2></div>
  <div id="pdp-reviews"></div>
</div></section>
<section class="section"><div class="shell">
  <div class="section-head section-head--split"><div><span class="eyebrow">You may also like</span><h2>Related pieces</h2></div></div>
  <div class="grid grid--4" id="pdp-related"></div>
</div></section>
'''
write("pages/product.html", storefront(
    "Product — Luxora Commerce", "Luxury piece detail.",
    REL, PRODUCT, features=["features/product", "features/catalog"]))

# ---------------------------------------------------------------------- cart
CART = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Bag</div>
  <h1>Your bag</h1>
</div></section>
<section class="section section--tight"><div class="shell" id="cart-wrap">
  <div class="cart-layout">
    <div id="cart-lines"></div>
    <div class="summary" id="cart-summary"></div>
  </div>
</div></section>
'''
write("pages/cart.html", storefront(
    "Your bag — Luxora Commerce", "Review the pieces in your bag.",
    REL, CART.replace("REL", REL), features=["features/checkout"]))

# ------------------------------------------------------------------ checkout
CHECKOUT = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span><a href="RELpages/cart.html">Bag</a><span>/</span>Checkout</div>
  <h1>Checkout</h1>
</div></section>
<section class="section section--tight"><div class="shell" id="checkout">
  <div class="checkout">
    <div>
      <div class="steps">
        <div class="step is-on" data-step="1"><span class="step__num">1</span>Contact</div>
        <div class="step" data-step="2"><span class="step__num">2</span>Shipping</div>
        <div class="step" data-step="3"><span class="step__num">3</span>Payment</div>
      </div>

      <div data-step-panel="1">
        <h3>Contact details</h3>
        <div class="grid-2">
          <label class="field"><span class="field__label">First name</span><input class="input" name="firstName" required><span class="field__error">Required</span></label>
          <label class="field"><span class="field__label">Last name</span><input class="input" name="lastName" required><span class="field__error">Required</span></label>
        </div>
        <label class="field"><span class="field__label">Email</span><input class="input" type="email" name="email" required><span class="field__error">Enter a valid email</span></label>
        <label class="field"><span class="field__label">Phone</span><input class="input" type="tel" name="phone"></label>
        <button class="btn btn--primary btn--lg" id="to-shipping">Continue to shipping</button>
      </div>

      <div data-step-panel="2" hidden>
        <h3>Shipping address</h3>
        <label class="field"><span class="field__label">Address</span><input class="input" name="address" required><span class="field__error">Required</span></label>
        <div class="grid-2">
          <label class="field"><span class="field__label">City</span><input class="input" name="city" required><span class="field__error">Required</span></label>
          <label class="field"><span class="field__label">Postal code</span><input class="input" name="postal" required><span class="field__error">Required</span></label>
        </div>
        <div class="grid-2">
          <label class="field"><span class="field__label">Country</span>
            <select class="select" name="country" required>
              <option value="">Select…</option><option>United States</option><option>United Kingdom</option>
              <option>Switzerland</option><option>Germany</option><option>France</option><option>United Arab Emirates</option>
              <option>Singapore</option><option>Canada</option><option>Australia</option><option>Japan</option>
            </select><span class="field__error">Required</span></label>
          <label class="field"><span class="field__label">Shipping method</span>
            <select class="select" name="shipping"><option>Express (1–4 days) — free over $500</option><option>Standard (3–7 days)</option></select></label>
        </div>
        <div class="cluster" style="gap:.75rem">
          <button class="btn btn--ghost" data-back-step="1">Back</button>
          <button class="btn btn--primary btn--lg" id="to-payment">Continue to payment</button>
        </div>
      </div>

      <div data-step-panel="3" hidden>
        <h3>Payment</h3>
        <div class="pay-option is-on" data-pay="Card"><input type="radio" name="pay" checked><span class="pay-option__label">Credit or debit card</span><span class="pay-option__tag">Visa · MC · Amex</span></div>
        <div class="pay-option" data-pay="PayPal"><input type="radio" name="pay"><span class="pay-option__label">PayPal</span></div>
        <div class="pay-option" data-pay="Apple Pay"><input type="radio" name="pay"><span class="pay-option__label">Apple Pay</span><span class="pay-option__tag">UI demo</span></div>
        <div class="pay-option" data-pay="Google Pay"><input type="radio" name="pay"><span class="pay-option__label">Google Pay</span><span class="pay-option__tag">UI demo</span></div>
        <div class="grid-2" style="margin-top:1rem">
          <label class="field"><span class="field__label">Card number</span><input class="input mono" name="card" placeholder="4242 4242 4242 4242" required><span class="field__error">Required</span></label>
          <div class="grid-2">
            <label class="field"><span class="field__label">Expiry</span><input class="input mono" name="expiry" placeholder="12 / 28" required><span class="field__error">Required</span></label>
            <label class="field"><span class="field__label">CVC</span><input class="input mono" name="cvc" placeholder="123" required><span class="field__error">Required</span></label>
          </div>
        </div>
        <label class="check" style="margin:1rem 0"><input type="checkbox" name="terms" required><span>I agree to the terms of sale and the return policy.</span></label>
        <div class="cluster" style="gap:.75rem">
          <button class="btn btn--ghost" data-back-step="2">Back</button>
          <button class="btn btn--primary btn--lg" id="place-order">Place order</button>
        </div>
        <p class="field__hint" style="margin-top:1rem">This is a portfolio demo. No card is charged and no data leaves your browser.</p>
      </div>
    </div>

    <div class="summary">
      <div class="card">
        <h3 style="font-size:1.4rem">Your order</h3>
        <div id="checkout-items" style="margin:1rem 0"></div>
        <div id="checkout-summary"></div>
      </div>
    </div>
  </div>
</div></section>
'''
write("pages/checkout.html", storefront(
    "Checkout — Luxora Commerce", "Secure checkout.",
    REL, CHECKOUT.replace("REL", REL), features=["features/checkout"]))

# ------------------------------------------------------------- confirmation
CONFIRM = '''
<section class="section"><div class="shell" id="confirmation"></div></section>
'''
write("pages/order-confirmation.html", storefront(
    "Order confirmed — Luxora Commerce", "Your order is confirmed.",
    REL, CONFIRM, features=["features/checkout"]))

# ----------------------------------------------------------------- wishlist
WISHLIST = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Wishlist</div>
  <h1>Your wishlist</h1>
  <p class="lead" id="wishlist-count-label"></p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="grid grid--4" id="wishlist-grid"></div>
</div></section>
'''
write("pages/wishlist.html", storefront(
    "Wishlist — Luxora Commerce", "Pieces you have saved.",
    REL, WISHLIST.replace("REL", REL), features=["features/pages"]))

# ------------------------------------------------------------------ compare
COMPARE = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Compare</div>
  <h1>Compare pieces</h1>
  <p class="lead">Line up to four pieces side by side. The concierge weighs them up for you underneath.</p>
</div></section>
<section class="section section--tight"><div class="shell" id="compare-view"></div></section>
'''
write("pages/compare.html", storefront(
    "Compare — Luxora Commerce", "Compare luxury pieces side by side with AI analysis.",
    REL, COMPARE.replace("REL", REL), features=["features/ai-pages"]))

# --------------------------------------------------------------- collections
COLLECTIONS = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Collections</div>
  <h1>Collections</h1>
  <p class="lead">Ten curated edits, each drawn from a different corner of the house.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="grid grid--3" id="collections-grid"></div>
</div></section>
'''
write("pages/collections.html", storefront(
    "Collections — Luxora Commerce", "Explore the Luxora collections.",
    REL, COLLECTIONS.replace("REL", REL), features=["features/pages"]))

print("commerce pages written")
