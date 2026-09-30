/* =========================================================================
   Luxora Commerce — product detail
   ========================================================================= */
(function (LX) {
  "use strict";

  function stockLine(p) {
    if (p.stock === 0) return '<span class="stock-line"><i class="stock-dot stock-dot--out"></i>Sold out — join the waiting list below</span>';
    if (p.stock <= 5) return '<span class="stock-line"><i class="stock-dot stock-dot--low"></i>Only ' + p.stock + " left in stock</span>";
    return '<span class="stock-line"><i class="stock-dot"></i>In stock — ships in ' + LX.esc(p.shippingTime) + "</span>";
  }

  /* One view per product photo: images[0] is the default, then -2, -3… */
  function galleryViews(p) {
    return (p.images || []).map((src, i) => ({ src: src, label: "Photo " + (i + 1) }));
  }

  function renderGallery(p) {
    const host = LX.$("#pdp-gallery");
    if (!host) return;
    const views = galleryViews(p);
    const multi = views.length > 1;
    host.innerHTML =
      '<div class="gallery__main" id="gallery-main">' +
        (p.limitedEdition ? '<span class="badge gallery__badge">Limited edition</span>'
          : p.discountPrice ? '<span class="badge badge--solid gallery__badge">' +
            Math.round((1 - p.discountPrice / p.price) * 100) + "% off</span>" : "") +
        '<img src="' + LX.url(views[0].src) + '" alt="' + LX.esc(p.name) + '" id="gallery-img" width="800" height="1000">' +
        (multi
          ? '<button class="icon-btn gallery__nav gallery__nav--prev" data-step="-1" aria-label="Previous photo">&#8249;</button>' +
            '<button class="icon-btn gallery__nav gallery__nav--next" data-step="1" aria-label="Next photo">&#8250;</button>' +
            '<span class="gallery__count mono" id="gallery-count">1 / ' + views.length + "</span>"
          : "") +
      "</div>" +
      (multi
        ? '<div class="gallery__thumbs" role="tablist">' +
          views.map((v, i) =>
            '<button class="gallery__thumb' + (i === 0 ? " is-on" : "") + '" data-view="' + i +
              '" role="tab" aria-selected="' + (i === 0) + '" title="' + v.label + '">' +
              '<img src="' + LX.url(v.src) + '" alt="' + LX.esc(p.name + " — " + v.label) + '" loading="lazy"></button>').join("") +
          "</div>"
        : "");

    const main = LX.$("#gallery-main");
    const img = LX.$("#gallery-img");
    let current = 0;

    function show(i) {
      current = (i + views.length) % views.length;
      img.src = LX.url(views[current].src);
      img.alt = p.name + (current ? " — " + views[current].label : "");
      LX.$$(".gallery__thumb", host).forEach((b, k) => {
        b.classList.toggle("is-on", k === current); b.setAttribute("aria-selected", String(k === current));
      });
      const c = LX.$("#gallery-count"); if (c) c.textContent = (current + 1) + " / " + views.length;
    }

    main.addEventListener("click", (e) => {
      const nav = e.target.closest(".gallery__nav");
      if (nav) { e.stopPropagation(); main.classList.remove("is-zoomed"); show(current + Number(nav.getAttribute("data-step"))); return; }
      main.classList.toggle("is-zoomed");
    });
    main.addEventListener("mousemove", (e) => {
      if (!main.classList.contains("is-zoomed")) return;
      const r = main.getBoundingClientRect();
      img.style.transformOrigin =
        ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%";
    });
    main.addEventListener("mouseleave", () => main.classList.remove("is-zoomed"));

    LX.$$(".gallery__thumb", host).forEach((btn) =>
      btn.addEventListener("click", () => show(Number(btn.getAttribute("data-view")))));

    /* Swipe between photos on touch screens. */
    let x0 = null;
    main.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", (e) => {
      if (x0 == null || !multi) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    });
  }

  function renderReviews(p) {
    const host = LX.$("#pdp-reviews");
    if (!host) return;
    const list = LX.reviewsFor(p.slug).sort((a, b) => b.date.localeCompare(a.date));
    const s = LX.AI.summarise(p.slug);

    const bars = s ? s.breakdown.map((b) =>
      '<div class="review-bar"><span style="width:3ch">' + b.stars + "★</span>" +
      '<span class="review-bar__track"><span class="review-bar__fill" style="width:' +
      (s.count ? (b.count / s.count * 100) : 0) + '%"></span></span>' +
      "<span style='width:3ch;text-align:right'>" + b.count + "</span></div>").join("") : "";

    host.innerHTML =
      (s ?
        '<div class="card" style="border-color:var(--gold-line);margin-bottom:2rem">' +
          '<div class="cluster" style="margin-bottom:1rem">' + LX.icon("spark", 18) +
            '<strong style="font-size:var(--step--1);letter-spacing:.08em;text-transform:uppercase;color:var(--lux-gold)">' +
            "AI review summary</strong></div>" +
          "<p style='margin:0'>" + LX.esc(s.text) + "</p>" +
          '<p class="muted" style="font-size:var(--step--2);margin:.75rem 0 0">Generated from all ' + s.count +
            " reviews on this page. It updates as new reviews are published.</p>" +
        "</div>" : "") +
      '<div class="review-summary">' +
        '<div class="review-score"><b>' + (s ? s.average.toFixed(1) : p.rating) + "</b>" +
          LX.stars(s ? s.average : p.rating) +
          '<div class="muted" style="font-size:var(--step--2);margin-top:.5rem">' + list.length + " reviews</div></div>" +
        "<div>" + bars + "</div>" +
      "</div>" +
      list.slice(0, 6).map((r) =>
        '<article class="review">' +
          '<div class="review__head">' +
            '<div class="avatar">' + LX.esc(r.initials) + "</div>" +
            "<div><b style='font-size:var(--step--1)'>" + LX.esc(r.author) + "</b>" +
            (r.verified ? ' <span class="badge badge--success" style="margin-left:.4rem">Verified purchase</span>' : "") +
            '<div class="muted" style="font-size:var(--step--2)">' + LX.dateShort(r.date) + "</div></div>" +
            '<div style="margin-left:auto">' + LX.stars(r.rating) + "</div>" +
          "</div>" +
          "<h4 style='margin-bottom:.35rem'>" + LX.esc(r.title) + "</h4>" +
          "<p style='margin-bottom:.5rem'>" + LX.esc(r.body) + "</p>" +
          '<div class="muted" style="font-size:var(--step--2)">' + r.helpful + " people found this helpful</div>" +
        "</article>").join("") +
      (list.length > 6 ? '<button class="btn btn--secondary btn--block" style="margin-top:1.5rem" id="more-reviews">Show all ' + list.length + " reviews</button>" : "");

    const more = LX.$("#more-reviews");
    if (more) more.addEventListener("click", () => {
      more.outerHTML = list.slice(6).map((r) =>
        '<article class="review"><div class="review__head"><div class="avatar">' + LX.esc(r.initials) + "</div>" +
        "<div><b style='font-size:var(--step--1)'>" + LX.esc(r.author) + "</b>" +
        '<div class="muted" style="font-size:var(--step--2)">' + LX.dateShort(r.date) + "</div></div>" +
        '<div style="margin-left:auto">' + LX.stars(r.rating) + "</div></div>" +
        "<h4 style='margin-bottom:.35rem'>" + LX.esc(r.title) + "</h4><p>" + LX.esc(r.body) + "</p></article>").join("");
    });
  }

  function render() {
    const host = LX.$("#pdp");
    if (!host) return;
    const slug = LX.params().get("p");
    const p = slug ? LX.productBySlug(slug) : null;

    if (!p) {
      host.innerHTML = '<div class="empty"><h3>That piece is no longer listed</h3>' +
        "<p>It may have sold out or moved to the archive.</p>" +
        '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
      return;
    }

    document.title = p.name + " — Luxora Commerce";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", p.shortDescription);
    LX.Recent.push(p.slug);

    const crumb = LX.$("#pdp-crumb");
    if (crumb) crumb.innerHTML =
      '<a href="' + LX.url("index.html") + '">Home</a><span>/</span>' +
      '<a href="' + LX.url("pages/shop.html") + '">Shop</a><span>/</span>' +
      '<a href="' + LX.url("pages/shop.html?cat=" + p.category) + '">' + LX.titleCase(p.category) + "</a>" +
      "<span>/</span>" + LX.esc(p.name);

    renderGallery(p);

    const sale = !!p.discountPrice;
    LX.$("#pdp-detail").innerHTML =
      '<span class="pdp__brand">' + LX.esc(p.brandName) + "</span>" +
      '<h1 class="pdp__title">' + LX.esc(p.name) + "</h1>" +
      '<div class="cluster">' + LX.stars(p.rating, p.reviewCount) +
        '<a class="muted" style="font-size:var(--step--2)" href="#reviews">Read the reviews</a></div>' +
      '<div class="pdp__price">' +
        '<span class="price' + (sale ? " price--now" : "") + '">' + LX.money(LX.priceOf(p)) + "</span>" +
        (sale ? '<span class="price--was">' + LX.money(p.price) + "</span>" +
          '<span class="badge badge--solid">Save ' + LX.money(p.price - p.discountPrice) + "</span>" : "") +
      "</div>" +
      "<p>" + LX.esc(p.description) + "</p>" +
      stockLine(p) +
      '<div class="pdp__row">' +
        '<div class="qty">' +
          '<button id="pdp-minus" aria-label="Reduce quantity">−</button>' +
          '<input id="pdp-qty" type="number" value="1" min="1" max="' + Math.max(1, p.stock) + '" aria-label="Quantity">' +
          '<button id="pdp-plus" aria-label="Increase quantity">+</button>' +
        "</div>" +
        '<button class="btn btn--primary" id="pdp-add"' + (p.stock === 0 ? " disabled" : "") + ">" +
          (p.stock === 0 ? "Sold out" : "Add to bag") + "</button>" +
      "</div>" +
      '<div class="pdp__row" style="margin-top:-.5rem">' +
        '<button class="btn btn--secondary" data-action="wishlist" data-slug="' + p.slug + '">Save to wishlist</button>' +
        '<button class="btn btn--ghost" data-action="compare" data-slug="' + p.slug + '">Add to comparison</button>' +
      "</div>" +
      '<div class="trust-row">' +
        "<div><strong>Free shipping</strong>On orders over $500</div>" +
        "<div><strong>2-year warranty</strong>International cover</div>" +
        "<div><strong>30-day returns</strong>Free of charge</div>" +
      "</div>" +
      '<dl class="spec-list">' +
        "<div><dt>Reference</dt><dd>" + LX.esc(p.sku) + "</dd></div>" +
        "<div><dt>Brand</dt><dd>" + LX.esc(p.brandName) + "</dd></div>" +
        "<div><dt>Collection</dt><dd>" + LX.titleCase(p.collection) + "</dd></div>" +
        "<div><dt>Material</dt><dd>" + LX.esc(p.material) + "</dd></div>" +
        "<div><dt>Colour</dt><dd>" + LX.esc(p.color) + "</dd></div>" +
        "<div><dt>Weight</dt><dd>" + LX.esc(p.weight) + "</dd></div>" +
        "<div><dt>Dimensions</dt><dd>" + LX.esc(p.dimensions) + "</dd></div>" +
        "<div><dt>Also</dt><dd>" + LX.esc(p.dimensions2) + "</dd></div>" +
      "</dl>" +
      '<div class="accordion" style="margin-top:2rem">' +
        ['<div class="accordion__item"><button class="accordion__btn" aria-expanded="false">Shipping and delivery<i>+</i></button>' +
          '<div class="accordion__panel"><div>Dispatched in ' + LX.esc(p.shippingTime) +
          ". Express shipping is free over $500, $35 below that. Every parcel is insured for its full value and requires a signature.</div></div></div>",
         '<div class="accordion__item"><button class="accordion__btn" aria-expanded="false">Returns<i>+</i></button>' +
          '<div class="accordion__panel"><div>' + LX.esc(p.returnPolicy) +
          ". The piece must be unworn with its certificate. Engraved and resized items are final sale.</div></div></div>",
         '<div class="accordion__item"><button class="accordion__btn" aria-expanded="false">Care<i>+</i></button>' +
          '<div class="accordion__panel"><div>' + LX.esc(p.care) + "</div></div></div>",
         '<div class="accordion__item"><button class="accordion__btn" aria-expanded="false">Warranty<i>+</i></button>' +
          '<div class="accordion__panel"><div>' + LX.esc(p.warranty) +
          " against manufacturing faults, from the delivery date. Register the piece in your account to activate it.</div></div></div>"].join("") +
      "</div>";

    /* Accordions in freshly injected markup need binding after the fact. */
    LX.$$("#pdp-detail .accordion__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion__item");
        const panel = LX.$(".accordion__panel", item);
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
        panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      });
    });

    const qty = LX.$("#pdp-qty");
    LX.$("#pdp-minus").addEventListener("click", () => { qty.value = Math.max(1, (+qty.value || 1) - 1); });
    LX.$("#pdp-plus").addEventListener("click", () => { qty.value = Math.min(p.stock || 1, (+qty.value || 1) + 1); });
    const add = LX.$("#pdp-add");
    if (add) add.addEventListener("click", () => LX.Cart.add(p.slug, qty.value));

    renderReviews(p);

    /* Related: same category first, then the same collection, price-ranked. */
    const related = LX.data().products
      .filter((x) => x.slug !== p.slug)
      .map((x) => ({
        p: x,
        s: (x.category === p.category ? 6 : 0) + (x.collection === p.collection ? 4 : 0) +
           (x.brand === p.brand ? 2 : 0) - Math.abs(LX.priceOf(x) - LX.priceOf(p)) / 4000,
      }))
      .sort((a, b) => b.s - a.s).slice(0, 4).map((r) => r.p);
    LX.renderGrid("#pdp-related", related);

    LX.syncCounters();
    LX.revealScan();

    /* Structured data for search engines — a real storefront requirement. */
    const ld = {
      "@context": "https://schema.org", "@type": "Product",
      name: p.name, sku: p.sku, description: p.shortDescription,
      brand: { "@type": "Brand", name: p.brandName },
      image: p.images.map((src) => new URL(LX.url(src), location.href).href),
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
      offers: {
        "@type": "Offer", price: LX.priceOf(p), priceCurrency: "USD",
        availability: p.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.append(tag);
  }

  document.addEventListener("DOMContentLoaded", render);
})(window.LX);
