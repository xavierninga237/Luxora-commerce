/* =========================================================================
   Luxora Commerce — shared chrome
   Header, mega menu, footer, cart drawer, search drawer, mobile nav.
   Injected into [data-chrome] slots so markup lives in one place only.
   ========================================================================= */
(function (LX) {
  "use strict";
  const U = LX.url;

  function header() {
    return '' +
'<div class="announce">Complimentary express shipping on orders over <strong>$500</strong> · Worldwide</div>' +
'<header class="site-header"><div class="shell"><nav class="nav" aria-label="Primary">' +
  '<a class="nav__brand" href="' + U("index.html") + '" aria-label="Luxora Commerce home">' +
    '<img src="' + U("assets/images/logos/luxora-mark.png") + '" alt="">' +
    '<span class="nav__brand-text"><span class="nav__brand-name">LUXORA</span>' +
    '<span class="nav__brand-sub">Commerce</span></span></a>' +
  '<div class="has-mega" style="position:static">' +
    '<ul class="nav__links">' +
      '<li><a href="' + U("pages/shop.html") + '">Shop</a></li>' +
      '<li><a href="' + U("pages/collections.html") + '">Collections</a></li>' +
      '<li><a href="' + U("pages/shop.html?cat=watches") + '">Watches</a></li>' +
      '<li><a href="' + U("pages/shop.html?categories=rings,necklaces,bracelets,earrings") + '">Jewelry</a></li>' +
      '<li><a href="' + U("pages/shop.html?cat=accessories") + '">Accessories</a></li>' +
      '<li><a href="' + U("pages/ai-assistant.html") + '">Concierge</a></li>' +
      '<li><a href="' + U("pages/journal.html") + '">Journal</a></li>' +
    '</ul>' +
    megaMenu() +
  '</div>' +
  '<div class="nav__tools">' +
    '<button class="nav__tool" data-action="open-search" aria-label="Search">' + LX.icon("search") + '</button>' +
    '<a class="nav__tool hide-sm" href="' + U("pages/compare.html") + '" aria-label="Compare">' + LX.icon("compare") +
      '<span class="nav__count" data-count-for="compare-count"></span></a>' +
    '<a class="nav__tool" href="' + U("pages/wishlist.html") + '" aria-label="Wishlist">' + LX.icon("heart") +
      '<span class="nav__count" data-count-for="wishlist-count"></span></a>' +
    '<button class="nav__tool" data-action="open-cart" aria-label="Bag">' + LX.icon("bag") +
      '<span class="nav__count" data-count-for="cart-count"></span></button>' +
    '<a class="nav__tool hide-sm" href="' + U("account/dashboard.html") + '" aria-label="Account">' + LX.icon("user") + '</a>' +
    '<button class="nav__tool nav__burger" data-action="open-menu" aria-label="Menu">' + LX.icon("menu") + '</button>' +
  '</div>' +
'</nav></div></header>';
  }

  function megaMenu() {
    const d = LX.data();
    const catCol = (title, cats) => '<div class="mega__col"><h5>' + title + '</h5><ul>' +
      cats.map((c) => '<li><a href="' + U("pages/shop.html?cat=" + c.slug) + '">' + c.name + '</a></li>').join("") + '</ul></div>';
    return '<div class="mega"><div class="shell"><div class="mega__grid">' +
      catCol("Categories", d.categories.slice(0, 3)) +
      catCol("More", d.categories.slice(3)) +
      '<div class="mega__col"><h5>Collections</h5><ul>' +
        d.collections.slice(0, 5).map((c) => '<li><a href="' + U("pages/shop.html?collection=" + c.slug) + '">' + c.name.replace(" Collection", "") + '</a></li>').join("") +
      '</ul></div>' +
      '<a class="mega__promo" href="' + U("pages/ai-assistant.html") + '">' +
        '<img src="' + U("assets/images/scenes/menu-promo.webp") + '" alt="">' +
        '<div><strong style="color:var(--lux-gold);font-size:var(--step--2);letter-spacing:.1em;text-transform:uppercase">AI Concierge</strong>' +
        '<p style="margin:.4rem 0 0;font-size:var(--step--1)">Describe the occasion. We will find the piece.</p></div></a>' +
    '</div></div></div>';
  }

  function footer() {
    const col = (title, links) => '<div class="footer__col"><h5>' + title + '</h5><ul>' +
      links.map((l) => '<li><a href="' + l[1] + '">' + l[0] + '</a></li>').join("") + '</ul></div>';
    return '' +
'<footer class="site-footer"><div class="shell">' +
  '<div class="footer__grid">' +
    '<div class="footer__brand">' +
      '<img src="' + U("assets/images/logos/luxora-wordmark.png") + '" alt="Luxora Commerce">' +
      '<p class="muted" style="font-size:var(--step--1);max-width:34ch">Timeless luxury, delivered worldwide. Watches and fine jewelry, made in small runs and inspected by hand.</p>' +
      '<div class="social" style="margin-top:1rem">' +
        '<a href="#" aria-label="Instagram">' + LX.icon("spark", 16) + '</a>' +
        '<a href="#" aria-label="Journal">' + LX.icon("doc", 16) + '</a>' +
        '<a href="#" aria-label="Contact">' + LX.icon("bell", 16) + '</a>' +
      '</div>' +
    '</div>' +
    col("Shop", [["Watches", U("pages/shop.html?cat=watches")], ["Jewelry", U("pages/shop.html?categories=rings,necklaces,bracelets,earrings")],
      ["Accessories", U("pages/shop.html?cat=accessories")], ["Collections", U("pages/collections.html")]]) +
    col("Company", [["About", U("pages/about.html")], ["Journal", U("pages/journal.html")],
      ["Careers", U("pages/about.html")], ["Contact", U("pages/contact.html")]]) +
    col("Support", [["FAQ", U("pages/faq.html")], ["Shipping", U("pages/faq.html")],
      ["Returns", U("pages/faq.html")], ["Warranty", U("pages/faq.html")]]) +
    col("Account", [["Sign in", U("auth/login.html")], ["Orders", U("account/orders.html")],
      ["Wishlist", U("pages/wishlist.html")], ["Admin", U("admin/dashboard.html")]]) +
  '</div>' +
  '<div class="footer__bottom">' +
    '<span>© 2026 Luxora Commerce. A portfolio demonstration project.</span>' +
    '<div class="footer__pay"><span>VISA</span><span>MC</span><span>AMEX</span><span>PAYPAL</span><span>APPLE PAY</span><span>G PAY</span></div>' +
  '</div>' +
'</div></footer>';
  }

  function drawers() {
    return '' +
'<aside class="drawer" id="cart-drawer" aria-label="Shopping bag">' +
  '<div class="drawer__head"><h2 class="drawer__title">Your bag</h2>' +
    '<button class="icon-btn" data-action="close-overlays" aria-label="Close">' + LX.icon("close", 17) + '</button></div>' +
  '<div class="drawer__body" id="cart-drawer-body"></div>' +
  '<div class="drawer__foot" id="cart-drawer-foot"></div>' +
'</aside>' +
'<aside class="drawer" id="search-drawer" aria-label="Search">' +
  '<div class="drawer__head"><h2 class="drawer__title">Search</h2>' +
    '<button class="icon-btn" data-action="close-overlays" aria-label="Close">' + LX.icon("close", 17) + '</button></div>' +
  '<div class="drawer__body">' +
    '<form id="search-form"><div class="field" style="margin-bottom:1.5rem">' +
      '<input class="input" id="search-input" placeholder="Search watches, jewelry, materials…" autocomplete="off" aria-label="Search products"></div></form>' +
    '<div id="search-results"></div>' +
  '</div>' +
'</aside>' +
tabbar() +
'<aside class="drawer drawer--left" id="mobile-nav" aria-label="Menu">' +
  '<div class="drawer__head"><h2 class="drawer__title">Menu</h2>' +
    '<button class="icon-btn" data-action="close-overlays" aria-label="Close">' + LX.icon("close", 17) + '</button></div>' +
  '<div class="drawer__body"><ul class="mobile-nav__list">' +
    [["Shop", U("pages/shop.html")], ["Collections", U("pages/collections.html")],
     ["Watches", U("pages/shop.html?cat=watches")], ["Jewelry", U("pages/shop.html?categories=rings,necklaces,bracelets,earrings")],
     ["Concierge", U("pages/ai-assistant.html")], ["Gift Finder", U("pages/gift-finder.html")],
     ["Compare", U("pages/compare.html")], ["Wishlist", U("pages/wishlist.html")],
     ["Account", U("account/dashboard.html")], ["Journal", U("pages/journal.html")]]
      .map((l) => '<li><a href="' + l[1] + '">' + l[0] + LX.icon("chev", 18) + '</a></li>').join("") +
  '</ul></div>' +
'</aside>';
  }

  /* App-style bottom navigation for phones — the pattern shoppers expect. */
  function tabbar() {
    const here = location.pathname;
    const on = (test) => (test ? ' aria-current="page"' : "");
    const isHome = /\/(index\.html)?$/.test(here) && !/\/(pages|account|auth|admin)\//.test(here);
    return '<nav class="tabbar" aria-label="Quick navigation">' +
      '<a href="' + U("index.html") + '"' + on(isHome) + ">" + LX.icon("home", 20) + "<span>Home</span></a>" +
      '<a href="' + U("pages/shop.html") + '"' + on(/shop\.html|collections\.html|product\.html/.test(here)) + ">" + LX.icon("grid", 20) + "<span>Shop</span></a>" +
      '<a href="' + U("pages/ai-assistant.html") + '"' + on(/ai-assistant|gift-finder/.test(here)) + ">" + LX.icon("spark", 20) + "<span>Concierge</span></a>" +
      '<a href="' + U("pages/wishlist.html") + '"' + on(/wishlist/.test(here)) + ">" + LX.icon("heart", 20) +
        '<span>Wishlist</span><i class="tabbar__count" data-count-for="wishlist-count"></i></a>' +
      '<button type="button" data-action="open-cart"' + on(/cart\.html|checkout/.test(here)) + ">" + LX.icon("bag", 20) +
        '<span>Bag</span><i class="tabbar__count" data-count-for="cart-count"></i></button>' +
    "</nav>";
  }

  function inject() {
    LX.$$("[data-chrome='header']").forEach((n) => { n.innerHTML = header(); });
    LX.$$("[data-chrome='footer']").forEach((n) => { n.innerHTML = footer(); });
    LX.$$("[data-chrome='drawers']").forEach((n) => { n.innerHTML = drawers(); });
    /* Re-run the pieces of boot that depend on this markup existing. */
    LX.syncCounters();
    LX.renderCartDrawer();
    const here = location.pathname.split("/").pop() || "index.html";
    LX.$$(".nav__links a").forEach((a) => {
      const target = (a.getAttribute("href") || "").split("/").pop().split("?")[0];
      if (target === here) a.setAttribute("aria-current", "page");
    });
  }

  /* Inject as early as possible so there is no flash of missing header. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  LX.chrome = { header, footer, drawers, tabbar, inject };
})(window.LX);
