/* =========================================================================
   Luxora Commerce — shared UI
   Header, drawers, modals, card rendering, and the delegated action layer
   that every page reuses via data-action attributes.
   ========================================================================= */
(function (LX) {
  "use strict";

  /* ------------------------------------------------------------------ icons */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    heart:  '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z"/>',
    home:   '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    bag:    '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7V5a3 3 0 016 0v2"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    compare:'<path d="M4 7h7M4 17h7M17 4v16"/><path d="M14 8l3-4 3 4M14 16l3 4 3-4"/>',
    menu:   '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close:  '<path d="M6 6l12 12M18 6L6 18"/>',
    chev:   '<path d="M9 6l6 6-6 6"/>',
    trash:  '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    check:  '<path d="M20 6L9 17l-5-5"/>',
    truck:  '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    lock:   '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    spark:  '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
    grid:   '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    box:    '<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/>',
    chart:  '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users:  '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M17 8.5a3 3 0 100-5"/>',
    tag:    '<path d="M3 12V4h8l9 9-8 8-9-9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    star:   '<path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z"/>',
    gear:   '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    doc:    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    bell:   '<path d="M18 16V11a6 6 0 10-12 0v5l-2 3h16z"/><path d="M10 22h4"/>',
    pin:    '<path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    card:   '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    back:   '<path d="M15 6l-6 6 6 6"/>',
    plus:   '<path d="M12 5v14M5 12h14"/>',
    eye:    '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
    rotate: '<path d="M20 12a8 8 0 11-2.3-5.7"/><path d="M20 3v5h-5"/>',
  };

  function icon(name, size) {
    const body = ICONS[name] || "";
    const s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + body + "</svg>";
  }

  /* ----------------------------------------------------------- product card */
  function productCard(p, opts) {
    opts = opts || {};
    const href = LX.url("pages/product.html?p=" + p.slug);
    const saved = LX.Wishlist.has(p.slug);
    const inCompare = LX.Compare.has(p.slug);
    const sale = !!p.discountPrice;
    const out = p.stock === 0;

    const flags = [];
    if (out) flags.push('<span class="badge badge--muted">Sold out</span>');
    else if (sale) flags.push('<span class="badge badge--solid">' +
      Math.round((1 - p.discountPrice / p.price) * 100) + "% off</span>");
    if (p.limitedEdition) flags.push('<span class="badge">Limited</span>');
    else if (p.newArrival) flags.push('<span class="badge">New</span>');
    else if (p.bestseller && !sale) flags.push('<span class="badge">Bestseller</span>');

    const priceHtml = sale
      ? '<span class="price"><span class="price--was">' + LX.money(p.price) + '</span>' +
        '<span class="price--now">' + LX.money(p.discountPrice) + "</span></span>"
      : '<span class="price">' + LX.money(p.price) + "</span>";

    return '' +
      '<article class="product-card reveal" data-slug="' + p.slug + '">' +
        '<div class="product-card__media">' +
          '<a href="' + href + '" aria-label="' + LX.esc(p.name) + '">' +
            '<img src="' + LX.url(p.images[0]) + '" alt="' + LX.esc(p.name) + '" loading="lazy" width="800" height="1000">' +
            (p.images[1] ? '<img class="product-card__alt" src="' + LX.url(p.images[1]) + '" alt="" aria-hidden="true" loading="lazy" width="800" height="1000">' : "") +
          "</a>" +
          '<div class="product-card__flags">' + flags.join("") + "</div>" +
          '<div class="product-card__tools">' +
            '<button class="icon-btn' + (saved ? " is-on" : "") + '" data-action="wishlist" data-slug="' + p.slug +
              '" aria-pressed="' + saved + '" title="Save to wishlist" aria-label="Save ' + LX.esc(p.name) + ' to wishlist">' + icon("heart", 17) + "</button>" +
            '<button class="icon-btn' + (inCompare ? " is-on" : "") + '" data-action="compare" data-slug="' + p.slug +
              '" aria-pressed="' + inCompare + '" title="Add to comparison" aria-label="Compare ' + LX.esc(p.name) + '">' + icon("compare", 17) + "</button>" +
            '<button class="icon-btn" data-action="quickview" data-slug="' + p.slug +
              '" title="Quick view" aria-label="Quick view of ' + LX.esc(p.name) + '">' + icon("eye", 17) + "</button>" +
          "</div>" +
          (opts.noCart ? "" :
          '<div class="product-card__quick">' +
            '<button class="btn btn--primary btn--sm btn--block" data-action="add" data-slug="' + p.slug + '"' +
              (out ? " disabled" : "") + ">" + (out ? "Sold out" : "Add to bag") + "</button>" +
          "</div>") +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__brand">' + LX.esc(p.brandName) + "</span>" +
          '<h3 class="product-card__name"><a href="' + href + '">' + LX.esc(p.name) + "</a></h3>" +
          LX.stars(p.rating, p.reviewCount) +
          '<div class="product-card__meta">' + priceHtml +
            (out ? '<span class="badge badge--error">0 left</span>'
                 : p.stock <= 5 ? '<span class="badge badge--warn">' + p.stock + " left</span>" : "") +
          "</div>" +
        "</div>" +
      "</article>";
  }

  function renderGrid(target, products, opts) {
    const node = typeof target === "string" ? LX.$(target) : target;
    if (!node) return;
    if (!products.length) {
      node.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
        "<h3>Nothing matches those filters</h3>" +
        "<p>Clear a filter or two and the catalogue will open back up.</p>" +
        '<button class="btn btn--secondary" data-action="clear-filters">Clear all filters</button></div>';
      return;
    }
    node.innerHTML = products.map((p) => productCard(p, opts)).join("");
    revealScan(node);
  }

  /* ------------------------------------------------------------- reveal */
  let observer = null;
  function revealScan(root) {
    const nodes = LX.$$(".reveal:not(.is-in)", root || document);
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); observer.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    }
    nodes.forEach((n) => observer.observe(n));
  }

  /* ------------------------------------------------------------ overlays */
  const scrim = () => {
    let s = LX.$(".scrim");
    if (!s) {
      s = LX.el("div", { class: "scrim", "data-action": "close-overlays" });
      document.body.append(s);
    }
    return s;
  };

  function openPanel(node) {
    if (!node) return;
    node.classList.add("is-open");
    scrim().classList.add("is-open");
    document.body.classList.add("is-locked");
    const focusable = node.querySelector("input, button, a[href], select, textarea");
    if (focusable) setTimeout(() => focusable.focus(), 120);
  }

  function closeOverlays() {
    LX.$$(".drawer.is-open, .modal.is-open").forEach((n) => n.classList.remove("is-open"));
    const s = LX.$(".scrim");
    if (s) s.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  }

  /* ---------------------------------------------------------- cart drawer */
  function renderCartDrawer() {
    const body = LX.$("#cart-drawer-body");
    const foot = LX.$("#cart-drawer-foot");
    if (!body) return;
    const t = LX.Cart.totals();

    if (!t.items.length) {
      body.innerHTML = '<div class="empty" style="border:0">' +
        "<h3>Your bag is empty</h3>" +
        "<p>Pieces you add will be held here for seven days.</p>" +
        '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
      if (foot) foot.innerHTML = "";
      return;
    }

    body.innerHTML = t.items.map((i) =>
      '<div class="cart-line" style="grid-template-columns:72px 1fr auto">' +
        '<a href="' + LX.url("pages/product.html?p=" + i.product.slug) + '">' +
          '<img src="' + LX.url(i.product.images[0]) + '" alt="' + LX.esc(i.product.name) + '" style="width:72px">' +
        "</a>" +
        "<div>" +
          '<h4 class="cart-line__name">' + LX.esc(i.product.name) + "</h4>" +
          '<div class="cart-line__meta">' + LX.esc(i.product.brandName) + " · " + LX.money(i.unit) + "</div>" +
          '<div class="qty" style="margin-top:.5rem">' +
            '<button data-action="qty-down" data-slug="' + i.product.slug + '" aria-label="Reduce quantity">−</button>' +
            '<input type="number" value="' + i.qty + '" min="1" max="' + i.product.stock +
              '" data-action="qty-set" data-slug="' + i.product.slug + '" aria-label="Quantity">' +
            '<button data-action="qty-up" data-slug="' + i.product.slug + '" aria-label="Increase quantity">+</button>' +
          "</div>" +
        "</div>" +
        '<div style="text-align:right">' +
          '<div class="price">' + LX.money(i.line) + "</div>" +
          '<button class="btn btn--ghost btn--sm" data-action="remove" data-slug="' + i.product.slug + '" style="margin-top:.5rem">Remove</button>' +
        "</div>" +
      "</div>").join("");

    if (foot) {
      foot.innerHTML =
        (t.toFreeShipping > 0
          ? '<p class="muted" style="font-size:var(--step--2);margin-bottom:.75rem">Add ' +
            LX.money(t.toFreeShipping) + " to qualify for free express shipping.</p>"
          : '<p class="text-gold" style="font-size:var(--step--2);margin-bottom:.75rem">Free express shipping applied.</p>') +
        '<div class="summary__row"><span>Subtotal</span><span class="mono">' + LX.money(t.subtotal) + "</span></div>" +
        (t.discount ? '<div class="summary__row"><span>' + t.coupon.code + '</span><span class="mono">−' + LX.money(t.discount) + "</span></div>" : "") +
        '<div class="summary__row summary__row--total"><span>Total</span><span>' + LX.money(t.total) + "</span></div>" +
        '<a class="btn btn--primary btn--block" href="' + LX.url("pages/checkout.html") + '" style="margin-top:1rem">Checkout</a>' +
        '<a class="btn btn--ghost btn--block" href="' + LX.url("pages/cart.html") + '" style="margin-top:.5rem">View full bag</a>';
    }
  }

  /* --------------------------------------------------------- quick view */
  function quickView(slug) {
    const p = LX.productBySlug(slug);
    if (!p) return;
    let modal = LX.$("#quickview");
    if (!modal) {
      modal = LX.el("div", { class: "modal", id: "quickview", role: "dialog", "aria-modal": "true", "aria-label": "Quick view" });
      modal.innerHTML = '<div class="modal__panel"><button class="icon-btn modal__close" data-action="close-overlays" aria-label="Close">' +
        icon("close", 17) + '</button><div id="quickview-body"></div></div>';
      document.body.append(modal);
    }
    const sale = !!p.discountPrice;
    LX.$("#quickview-body", modal).innerHTML =
      '<div class="pdp" style="gap:2rem">' +
        '<div><img src="' + LX.url(p.images[0]) + '" alt="' + LX.esc(p.name) +
          '" style="border-radius:var(--radius-card);border:1px solid var(--border)"></div>' +
        "<div>" +
          '<span class="pdp__brand">' + LX.esc(p.brandName) + "</span>" +
          '<h2 class="pdp__title">' + LX.esc(p.name) + "</h2>" +
          LX.stars(p.rating, p.reviewCount) +
          "<p style='margin-top:1rem'>" + LX.esc(p.shortDescription) + "</p>" +
          '<div class="pdp__price"><span class="price' + (sale ? " price--now" : "") + '">' +
            LX.money(LX.priceOf(p)) + "</span>" +
            (sale ? '<span class="price--was">' + LX.money(p.price) + "</span>" : "") + "</div>" +
          '<dl class="spec-list" style="grid-template-columns:1fr">' +
            "<div><dt>Material</dt><dd>" + LX.esc(p.material) + "</dd></div>" +
            "<div><dt>Reference</dt><dd>" + LX.esc(p.sku) + "</dd></div>" +
            "<div><dt>Ships in</dt><dd>" + LX.esc(p.shippingTime) + "</dd></div>" +
          "</dl>" +
          '<div class="pdp__row">' +
            '<button class="btn btn--primary" data-action="add" data-slug="' + p.slug + '"' +
              (p.stock === 0 ? " disabled" : "") + ">" + (p.stock === 0 ? "Sold out" : "Add to bag") + "</button>" +
            '<a class="btn btn--secondary" href="' + LX.url("pages/product.html?p=" + p.slug) + '">Full details</a>' +
          "</div>" +
        "</div>" +
      "</div>";
    openPanel(modal);
  }

  /* --------------------------------------------------------- counters */
  function syncCounters() {
    const map = { "cart-count": LX.Cart.count(), "wishlist-count": LX.Wishlist.count(), "compare-count": LX.Compare.count() };
    Object.keys(map).forEach((id) => {
      LX.$$("[data-count-for='" + id + "']").forEach((n) => {
        n.textContent = map[id] || "";
        n.setAttribute("data-count", map[id]);
      });
    });
    LX.$$("[data-action='wishlist']").forEach((b) => {
      const on = LX.Wishlist.has(b.getAttribute("data-slug"));
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on);
    });
    LX.$$("[data-action='compare']").forEach((b) => {
      const on = LX.Compare.has(b.getAttribute("data-slug"));
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on);
    });
  }

  /* ------------------------------------------------------- action layer */
  function bindActions() {
    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-action]");
      if (!trigger) return;
      const action = trigger.getAttribute("data-action");
      const slug = trigger.getAttribute("data-slug");

      switch (action) {
        case "add":            e.preventDefault(); LX.Cart.add(slug, trigger.getAttribute("data-qty") || 1); break;
        case "remove":         e.preventDefault(); LX.Cart.remove(slug); break;
        case "qty-up":         e.preventDefault(); LX.Cart.setQty(slug, (LX.Cart.lines().filter((l) => l.slug === slug)[0] || {}).qty + 1); break;
        case "qty-down":       e.preventDefault(); LX.Cart.setQty(slug, (LX.Cart.lines().filter((l) => l.slug === slug)[0] || {}).qty - 1); break;
        case "wishlist":       e.preventDefault(); LX.Wishlist.toggle(slug); break;
        case "compare":        e.preventDefault(); LX.Compare.toggle(slug); break;
        case "quickview":      e.preventDefault(); quickView(slug); break;
        case "open-cart":      e.preventDefault(); renderCartDrawer(); openPanel(LX.$("#cart-drawer")); break;
        case "open-search":    e.preventDefault(); openPanel(LX.$("#search-drawer")); break;
        case "open-menu":      e.preventDefault(); openPanel(LX.$("#mobile-nav")); break;
        case "close-overlays": e.preventDefault(); closeOverlays(); break;
        case "sign-out":       e.preventDefault(); LX.Session.signOut(); LX.toast("Signed out", "See you soon."); setTimeout(() => location.reload(), 600); break;
        case "scroll-to": {
          e.preventDefault();
          const t = LX.$(trigger.getAttribute("data-target"));
          if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
        default: break;
      }
    });

    document.addEventListener("change", function (e) {
      const t = e.target.closest("[data-action='qty-set']");
      if (t) LX.Cart.setQty(t.getAttribute("data-slug"), t.value);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOverlays();
      if (e.key === "/" && !/input|textarea|select/i.test(e.target.tagName)) {
        e.preventDefault(); openPanel(LX.$("#search-drawer"));
      }
    });
  }

  /* -------------------------------------------------------- tabs, etc. */
  function bindTabs() {
    LX.$$("[data-tabs]").forEach((group) => {
      const tabs = LX.$$(".tab", group);
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const target = tab.getAttribute("data-tab");
          tabs.forEach((t) => { t.classList.toggle("is-on", t === tab); t.setAttribute("aria-selected", t === tab); });
          LX.$$("[data-tab-panel]").forEach((p) => {
            if (p.closest("[data-tabs]") === group || group.getAttribute("data-tabs") === "page")
              p.classList.toggle("is-on", p.getAttribute("data-tab-panel") === target);
          });
        });
      });
    });
  }

  function bindAccordions() {
    LX.$$(".accordion__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion__item");
        const panel = LX.$(".accordion__panel", item);
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
        panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      });
    });
  }

  function bindHeader() {
    const header = LX.$(".site-header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function bindRails() {
    LX.$$("[data-rail]").forEach((wrap) => {
      const rail = LX.$(".rail", wrap);
      if (!rail) return;
      LX.$$("[data-rail-dir]", wrap).forEach((btn) => {
        btn.addEventListener("click", () => {
          const dir = btn.getAttribute("data-rail-dir") === "next" ? 1 : -1;
          rail.scrollBy({ left: dir * (rail.clientWidth * 0.8), behavior: "smooth" });
        });
      });
    });
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    bindActions(); bindTabs(); bindAccordions(); bindHeader(); bindRails();
    revealScan(); syncCounters(); renderCartDrawer();

    LX.bus.on("cart:change", () => { syncCounters(); renderCartDrawer(); });
    LX.bus.on("wishlist:change", syncCounters);
    LX.bus.on("compare:change", syncCounters);

    /* Mark the current page in the primary navigation. */
    const here = location.pathname.split("/").pop() || "index.html";
    LX.$$(".nav__links a, .side-nav a, .admin__nav a").forEach((a) => {
      const target = (a.getAttribute("href") || "").split("/").pop().split("?")[0];
      if (target && target === here) {
        a.setAttribute("aria-current", "page");
        a.classList.add("is-on");
      }
    });

    /* Greet a signed-in visitor by name wherever there is a slot for it. */
    const user = LX.Session.user();
    LX.$$("[data-user-name]").forEach((n) => { n.textContent = user ? user.name : "Guest"; });
    LX.$$("[data-when-signed-in]").forEach((n) => { n.hidden = !user; });
    LX.$$("[data-when-signed-out]").forEach((n) => { n.hidden = !!user; });
  }

  Object.assign(LX, {
    icon: icon, productCard: productCard, renderGrid: renderGrid, revealScan: revealScan,
    openPanel: openPanel, closeOverlays: closeOverlays, quickView: quickView,
    syncCounters: syncCounters, renderCartDrawer: renderCartDrawer, boot: boot,
  });

  document.addEventListener("DOMContentLoaded", boot);
})(window.LX);
