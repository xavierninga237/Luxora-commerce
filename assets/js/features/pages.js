/* =========================================================================
   Luxora Commerce — homepage assembly, wishlist, account, listings
   ========================================================================= */
(function (LX) {
  "use strict";

  const byFlag = (flag) => LX.data().products.filter((p) => p[flag]);

  /* Round-robin across a key so a curated strip never collapses into one
     category. Watches sit first in the catalogue, so a plain slice() made
     the homepage look like a watch-only shop. */
  function interleave(list, key, limit) {
    const buckets = {}, order = [];
    list.forEach((p) => {
      if (!buckets[p[key]]) { buckets[p[key]] = []; order.push(p[key]); }
      buckets[p[key]].push(p);
    });
    const out = [];
    for (let i = 0; out.length < limit; i++) {
      let added = false;
      for (let k = 0; k < order.length && out.length < limit; k++) {
        const item = buckets[order[k]][i];
        if (item) { out.push(item); added = true; }
      }
      if (!added) break;
    }
    return out;
  }

  /* ------------------------------------------------------------ homepage */
  function buildHome() {
    if (!LX.$("#home")) return;
    const d = LX.data();

    const featured = interleave(byFlag("featured"), "category", 8);
    LX.renderGrid("#home-featured", featured);

    const arrivals = interleave(
      byFlag("newArrival").concat(byFlag("bestseller")), "category", 10);
    const rail = LX.$("#home-arrivals");
    if (rail) { rail.innerHTML = arrivals.map((p) => LX.productCard(p)).join(""); LX.revealScan(rail); }

    const best = interleave(
      byFlag("bestseller").sort((a, b) => b.reviewCount - a.reviewCount), "category", 8);
    LX.renderGrid("#home-bestsellers", best);

    /* Category shortcuts — compact photo cards, like a shopping app */
    const cats = LX.$("#home-categories");
    if (cats) {
      cats.innerHTML = d.categories.map((c) =>
        '<a class="cat-card" href="' + LX.url("pages/shop.html?cat=" + c.slug) + '">' +
          '<span class="cat-card__img"><img src="' + LX.url(c.image) + '" alt="" loading="lazy"></span>' +
          "<b>" + LX.esc(c.name) + "</b><span>" +
          LX.data().products.filter((p) => p.category === c.slug).length + " pieces</span></a>").join("");
    }

    /* Service bar icons */
    LX.$$(".trustbar__ic[data-ic]").forEach((n) => { n.innerHTML = LX.icon(n.getAttribute("data-ic"), 22); });

    /* Sale banner copy comes from the live catalogue */
    const onSale = d.products.filter((p) => p.discountPrice);
    if (onSale.length && LX.$("#promo-title")) {
      const best = Math.max.apply(null, onSale.map((p) => Math.round((1 - p.discountPrice / p.price) * 100)));
      LX.$("#promo-title").textContent = "Up to " + best + "% off";
      LX.$("#promo-sub").textContent = onSale.length + " watches and jewelry pieces reduced, while stock lasts.";
    }

    /* Brand marquee */
    const brands = LX.$("#home-brands");
    if (brands) brands.innerHTML = d.brands.map((b) =>
      '<img src="' + LX.url(b.logo) + '" alt="' + LX.esc(b.name) + '" style="height:40px;opacity:.65" loading="lazy">').join("");

    /* Testimonials */
    const quotes = LX.$("#home-quotes");
    if (quotes) { quotes.innerHTML = d.testimonials.map((q) =>
      '<div class="quote-card reveal"><div>' + LX.stars(q.rating) + "</div>" +
      "<blockquote>“" + LX.esc(q.quote) + "”</blockquote>" +
      "<footer><div class='avatar'>" + LX.esc(q.initials) + "</div>" +
      "<div><b>" + LX.esc(q.name) + "</b><span>" + LX.esc(q.role) + "</span></div></footer></div>").join("");
      LX.revealScan(quotes);
    }

    /* Metrics count-up */
    LX.$$("[data-countup]").forEach((node) => {
      const target = parseFloat(node.getAttribute("data-countup"));
      const suffix = node.getAttribute("data-suffix") || "";
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const dur = 1400, t0 = performance.now();
          (function tick(now) {
            const k = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            const val = Math.round(target * eased);
            node.textContent = val.toLocaleString("en-US") + suffix;
            if (k < 1) requestAnimationFrame(tick);
          })(t0);
        });
      }, { threshold: .4 });
      io.observe(node);
    });

    /* AI assistant preview: a short scripted exchange */
    const preview = LX.$("#home-ai-log");
    if (preview) {
      const demo = LX.AI.reply("I need a wedding gift under $4000");
      preview.innerHTML =
        '<div class="msg msg--me"><div class="msg__avatar">You</div><div class="msg__bubble">I need a wedding gift under $4000.</div></div>' +
        '<div class="msg"><div class="msg__avatar">L</div><div class="msg__bubble"><p>' + LX.esc(demo.text) + "</p>" +
        (demo.picks.length ? '<div class="ai-picks">' + demo.picks.slice(0, 3).map((r) =>
          '<a class="ai-pick" href="' + LX.url("pages/product.html?p=" + r.product.slug) + '">' +
          '<img src="' + LX.url(r.product.images[0]) + '" alt=""><div><b>' + LX.esc(r.product.name) +
          "</b><span>" + LX.money(LX.priceOf(r.product)) + "</span></div></a>").join("") + "</div>" : "") +
        "</div></div>";
    }
  }

  /* ------------------------------------------------------------ wishlist */
  function buildWishlist() {
    const host = LX.$("#wishlist-grid");
    if (!host) return;
    function draw() {
      const items = LX.Wishlist.all().map(LX.productBySlug).filter(Boolean);
      const count = LX.$("#wishlist-count-label");
      if (count) count.textContent = items.length + (items.length === 1 ? " piece saved" : " pieces saved");
      if (!items.length) {
        host.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>Your wishlist is empty</h3>' +
          "<p>Tap the heart on any piece to keep it here for later.</p>" +
          '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
        return;
      }
      LX.renderGrid(host, items);
    }
    draw();
    LX.bus.on("wishlist:change", draw);
  }

  /* --------------------------------------------------------- collections */
  function buildCollections() {
    const host = LX.$("#collections-grid");
    if (!host) return;
    host.innerHTML = LX.data().collections.map((c) => {
      const n = LX.data().products.filter((p) => p.collection === c.slug).length;
      return '<a class="tile tile--wide reveal" href="' + LX.url("pages/shop.html?collection=" + c.slug) + '">' +
        '<img src="' + LX.url(c.image) + '" alt="' + LX.esc(c.name) + '" loading="lazy">' +
        '<div class="tile__body"><div class="tile__meta">' + n + " pieces</div>" +
        '<h3 class="tile__title">' + LX.esc(c.name) + "</h3>" +
        "<p class='muted' style='font-size:var(--step--2);margin:.25rem 0 0'>" + LX.esc(c.blurb) + "</p></div></a>";
    }).join("");
    LX.revealScan(host);
  }

  /* ------------------------------------------------------------- account */
  function buildAccount() {
    const host = LX.$("#account-panels");
    if (!host) return;
    const user = LX.Session.user() || LX.Session.signIn("marcus.reyes@example.com", "Marcus Reyes");

    /* Dashboard cards */
    const dash = LX.$("#account-dashboard");
    if (dash) {
      const orders = LX.Orders.all();
      dash.innerHTML =
        '<div class="kpis">' +
          '<div class="kpi"><div class="kpi__label">Orders</div><div class="kpi__value mono">' + orders.length + "</div></div>" +
          '<div class="kpi"><div class="kpi__label">Wishlist</div><div class="kpi__value mono">' + LX.Wishlist.count() + "</div></div>" +
          '<div class="kpi"><div class="kpi__label">Tier</div><div class="kpi__value" style="font-family:var(--font-display)">' + LX.esc(user.tier) + "</div></div>" +
          '<div class="kpi"><div class="kpi__label">Member since</div><div class="kpi__value mono">' + LX.esc(user.since) + "</div></div>" +
        "</div>";
    }

    /* Orders list — placed orders first, then the seeded history */
    const ordersHost = LX.$("#account-orders");
    if (ordersHost) {
      const placed = LX.Orders.all();
      const seeded = LX.data().orders.slice(0, 6);
      const all = placed.concat(seeded);
      ordersHost.innerHTML = all.length ? all.map((o) =>
        '<div class="card" style="margin-bottom:1rem">' +
          '<div class="spread" style="flex-wrap:wrap;gap:1rem">' +
            "<div><div class='mono' style='color:var(--lux-gold)'>" + o.id + "</div>" +
            "<div class='muted' style='font-size:var(--step--2)'>" + LX.dateLong(o.date) + "</div></div>" +
            '<span class="badge ' + statusBadge(o.status) + '">' + o.status + "</span>" +
            "<div class='price'>" + LX.money(o.total) + "</div>" +
          "</div>" +
          '<div class="cluster" style="margin-top:1rem;gap:.5rem">' +
            (o.items || []).slice(0, 4).map((i) =>
              '<img src="' + LX.url(i.image) + '" alt="' + LX.esc(i.name) + '" style="width:44px;height:54px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">').join("") +
            (o.items && o.items.length > 4 ? "<span class='muted'>+" + (o.items.length - 4) + " more</span>" : "") +
          "</div></div>").join("")
        : '<div class="empty"><h3>No orders yet</h3><p>Your purchases will appear here.</p><a class="btn btn--primary" href="' +
          LX.url("pages/shop.html") + '">Browse the collection</a></div>';
    }

    /* Profile form */
    const profile = LX.$("#account-profile-form");
    if (profile) {
      profile.addEventListener("submit", (e) => {
        e.preventDefault();
        LX.toast("Profile saved", "Your details have been updated.");
      });
    }
  }

  function statusBadge(status) {
    return { Delivered: "badge--success", Shipped: "badge--info", Processing: "badge--info",
             Paid: "badge", Pending: "badge--warn", Cancelled: "badge--error",
             Refunded: "badge--muted" }[status] || "badge--muted";
  }

  /* --------------------------------------------------------------- auth */
  function bindAuth() {
    const form = LX.$("#auth-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (LX.$("#auth-email") || {}).value || "guest@luxora.com";
      const nameField = LX.$("#auth-name");
      LX.Session.signIn(email, nameField ? nameField.value : null);
      LX.toast("Welcome to Luxora", "You are signed in.");
      setTimeout(() => { location.href = LX.url("account/dashboard.html"); }, 700);
    });
  }

  function decorateSideNav() {
    LX.$$("#account-side a[data-ic]").forEach(function (a) {
      if (a.querySelector("svg")) return;
      a.insertAdjacentHTML("afterbegin", LX.icon(a.getAttribute("data-ic"), 16));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildHome(); buildWishlist(); buildCollections(); buildAccount(); bindAuth(); decorateSideNav();
  });
})(window.LX);
