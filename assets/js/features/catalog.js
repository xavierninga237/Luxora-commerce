/* =========================================================================
   Luxora Commerce — catalogue browsing
   Faceted filtering, sorting, pagination and instant search. Filter state
   lives in the URL so a filtered view can be shared or bookmarked.
   ========================================================================= */
(function (LX) {
  "use strict";

  const PER_PAGE = 12;

  const state = {
    categories: [], brands: [], collections: [], materials: [], colors: [],
    min: 0, max: 12000, q: "", sort: "featured", page: 1,
    inStock: false, onSale: false,
  };

  /* ------------------------------------------------------------ url sync */
  function readUrl() {
    const p = LX.params();
    ["categories", "brands", "collections", "materials", "colors"].forEach((k) => {
      const v = p.get(k);
      state[k] = v ? v.split(",").filter(Boolean) : [];
    });
    if (p.get("cat")) state.categories = [p.get("cat")];
    if (p.get("collection")) state.collections = [p.get("collection")];
    if (p.get("brand")) state.brands = [p.get("brand")];
    state.q = p.get("q") || "";
    state.sort = p.get("sort") || "featured";
    state.page = parseInt(p.get("page"), 10) || 1;
    state.min = parseInt(p.get("min"), 10) || 0;
    state.max = parseInt(p.get("max"), 10) || 12000;
    state.inStock = p.get("stock") === "1";
    state.onSale = p.get("sale") === "1";
  }

  function writeUrl(replace) {
    const p = new URLSearchParams();
    ["categories", "brands", "collections", "materials", "colors"].forEach((k) => {
      if (state[k].length) p.set(k, state[k].join(","));
    });
    if (state.q) p.set("q", state.q);
    if (state.sort !== "featured") p.set("sort", state.sort);
    if (state.page > 1) p.set("page", state.page);
    if (state.min > 0) p.set("min", state.min);
    if (state.max < 12000) p.set("max", state.max);
    if (state.inStock) p.set("stock", "1");
    if (state.onSale) p.set("sale", "1");
    const url = location.pathname + (p.toString() ? "?" + p : "");
    history[replace ? "replaceState" : "pushState"]({}, "", url);
  }

  /* ------------------------------------------------------------ querying */
  function matches(p) {
    if (state.categories.length && state.categories.indexOf(p.category) === -1) return false;
    if (state.brands.length && state.brands.indexOf(p.brand) === -1) return false;
    if (state.collections.length && state.collections.indexOf(p.collection) === -1) return false;
    if (state.materials.length && state.materials.indexOf(p.material) === -1) return false;
    if (state.colors.length && state.colors.indexOf(p.color) === -1) return false;
    if (state.inStock && p.stock === 0) return false;
    if (state.onSale && !p.discountPrice) return false;
    const price = LX.priceOf(p);
    if (price < state.min || price > state.max) return false;
    if (state.q) {
      const hay = [p.name, p.brandName, p.category, p.collection, p.material,
                   p.color, p.shortDescription, p.sku].join(" ").toLowerCase();
      if (!state.q.toLowerCase().split(/\s+/).every((t) => hay.indexOf(t) > -1)) return false;
    }
    return true;
  }

  const SORTS = {
    featured:  (a, b) => (b.featured - a.featured) || (b.bestseller - a.bestseller) || (b.rating - a.rating),
    "price-asc":  (a, b) => LX.priceOf(a) - LX.priceOf(b),
    "price-desc": (a, b) => LX.priceOf(b) - LX.priceOf(a),
    rating:    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    newest:    (a, b) => (b.newArrival - a.newArrival) || a.name.localeCompare(b.name),
    name:      (a, b) => a.name.localeCompare(b.name),
  };

  /* "Featured" is a curation, not a ranking, so once ranked we round-robin
     across categories. Otherwise watches (first in the catalogue and the most
     heavily flagged) fill the whole first page and the shop reads as a watch
     shop. Skipped when the shopper has already narrowed to one category. */
  function curate(list) {
    const buckets = {}, order = [];
    list.forEach((p) => {
      if (!buckets[p.category]) { buckets[p.category] = []; order.push(p.category); }
      buckets[p.category].push(p);
    });
    const out = [];
    for (let i = 0; out.length < list.length; i++) {
      let added = false;
      for (let k = 0; k < order.length; k++) {
        const item = buckets[order[k]][i];
        if (item) { out.push(item); added = true; }
      }
      if (!added) break;
    }
    return out;
  }

  function results() {
    const list = LX.data().products.filter(matches).sort(SORTS[state.sort] || SORTS.featured);
    if (state.sort === "featured" && state.categories.length !== 1) return curate(list);
    return list;
  }

  /* ------------------------------------------------------------- facets */
  function facetCounts(key, valueOf) {
    /* Count against everything except this facet, so a filter never shows
       its own options as zero once selected. */
    const saved = state[key];
    state[key] = [];
    const pool = LX.data().products.filter(matches);
    state[key] = saved;
    const counts = {};
    pool.forEach((p) => {
      const v = valueOf(p);
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  }

  function facetGroup(title, key, options, valueOf) {
    const counts = facetCounts(key, valueOf);
    const rows = options.map((o) => {
      const n = counts[o.value] || 0;
      const on = state[key].indexOf(o.value) > -1;
      return '<label class="check' + (n === 0 && !on ? " muted" : "") + '">' +
        '<input type="checkbox" data-facet="' + key + '" value="' + LX.esc(o.value) + '"' + (on ? " checked" : "") + ">" +
        "<span>" + LX.esc(o.label) + "</span><em>" + n + "</em></label>";
    }).join("");
    return '<div class="filter-group"><h5>' + title + "</h5>" + rows + "</div>";
  }

  function renderFilters() {
    const host = LX.$("#shop-filters");
    if (!host) return;
    const d = LX.data();
    host.innerHTML =
      facetGroup("Category", "categories", d.categories.map((c) => ({ value: c.slug, label: c.name })), (p) => p.category) +
      facetGroup("Collection", "collections", d.collections.map((c) => ({ value: c.slug, label: c.name.replace(" Collection", "") })), (p) => p.collection) +
      facetGroup("Brand", "brands", d.brands.map((b) => ({ value: b.slug, label: b.name })), (p) => p.brand) +
      facetGroup("Material", "materials", d.materials.map((m) => ({ value: m, label: m })), (p) => p.material) +
      facetGroup("Colour", "colors", d.colors.map((c) => ({ value: c, label: c })), (p) => p.color) +
      '<div class="filter-group"><h5>Price</h5>' +
        '<div class="range"><input type="range" id="price-range" min="0" max="12000" step="50" value="' + state.max + '">' +
        '<output id="price-out">' + LX.money(state.max) + "</output></div>" +
        '<p class="field__hint">Showing pieces up to this price.</p></div>' +
      '<div class="filter-group"><h5>Availability</h5>' +
        '<label class="check"><input type="checkbox" id="f-stock"' + (state.inStock ? " checked" : "") + "><span>In stock only</span></label>" +
        '<label class="check"><input type="checkbox" id="f-sale"' + (state.onSale ? " checked" : "") + "><span>Reduced</span></label></div>" +
      '<button class="btn btn--ghost btn--sm btn--block" data-action="clear-filters">Clear all filters</button>';
  }

  function renderActive() {
    const host = LX.$("#shop-active");
    if (!host) return;
    const chips = [];
    const push = (key, value, label) =>
      chips.push('<button class="chip is-on" data-remove-facet="' + key + '" data-value="' + LX.esc(value) + '">' +
        LX.esc(label) + '<span class="chip__x">×</span></button>');

    state.categories.forEach((v) => push("categories", v, LX.titleCase(v)));
    state.collections.forEach((v) => push("collections", v, LX.titleCase(v)));
    state.brands.forEach((v) => push("brands", v, LX.titleCase(v)));
    state.materials.forEach((v) => push("materials", v, v));
    state.colors.forEach((v) => push("colors", v, v));
    if (state.q) push("q", state.q, '"' + state.q + '"');
    if (state.inStock) push("inStock", "1", "In stock");
    if (state.onSale) push("onSale", "1", "Reduced");
    if (state.max < 12000) push("max", "12000", "Up to " + LX.money(state.max));

    host.innerHTML = chips.length
      ? chips.join("") + '<button class="chip" data-action="clear-filters">Clear all</button>'
      : "";
  }

  function renderPager(total) {
    const host = LX.$("#shop-pager");
    if (!host) return;
    const pages = Math.ceil(total / PER_PAGE);
    if (pages <= 1) { host.innerHTML = ""; return; }
    let html = '<button data-page="' + (state.page - 1) + '"' + (state.page === 1 ? " disabled" : "") + ">Previous</button>";
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
        html += '<button data-page="' + i + '" class="' + (i === state.page ? "is-on" : "") + '">' + i + "</button>";
      } else if (Math.abs(i - state.page) === 2) {
        html += '<button disabled>…</button>';
      }
    }
    html += '<button data-page="' + (state.page + 1) + '"' + (state.page === pages ? " disabled" : "") + ">Next</button>";
    host.innerHTML = html;
  }

  function render() {
    const all = results();
    const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
    if (state.page > pages) state.page = pages;
    const slice = all.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

    LX.renderGrid("#shop-grid", slice);
    renderFilters();
    renderActive();
    renderPager(all.length);

    const count = LX.$("#shop-count");
    if (count) {
      count.textContent = all.length === 0 ? "No pieces match"
        : all.length + (all.length === 1 ? " piece" : " pieces") +
          (pages > 1 ? " · page " + state.page + " of " + pages : "");
    }
    const sort = LX.$("#shop-sort");
    if (sort) sort.value = state.sort;
  }

  function update(patch, opts) {
    Object.assign(state, patch);
    if (!patch.page) state.page = 1;
    writeUrl((opts || {}).replace);
    render();
    if ((opts || {}).scroll) {
      const grid = LX.$("#shop-grid");
      if (grid) window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" });
    }
  }

  /* --------------------------------------------------------------- bind */
  function bindShop() {
    const root = LX.$("#shop-grid");
    if (!root) return;
    readUrl();
    render();

    LX.$("#shop-sort") && LX.$("#shop-sort").addEventListener("change", (e) => update({ sort: e.target.value }));

    document.addEventListener("change", (e) => {
      const facet = e.target.closest("[data-facet]");
      if (facet) {
        const key = facet.getAttribute("data-facet");
        const value = facet.value;
        const list = state[key].slice();
        const i = list.indexOf(value);
        if (facet.checked && i === -1) list.push(value);
        if (!facet.checked && i > -1) list.splice(i, 1);
        const patch = {}; patch[key] = list;
        update(patch);
      }
      if (e.target.id === "f-stock") update({ inStock: e.target.checked });
      if (e.target.id === "f-sale") update({ onSale: e.target.checked });
    });

    document.addEventListener("input", (e) => {
      if (e.target.id === "price-range") {
        const out = LX.$("#price-out");
        if (out) out.textContent = LX.money(e.target.value);
      }
    });
    document.addEventListener("change", (e) => {
      if (e.target.id === "price-range") update({ max: parseInt(e.target.value, 10) });
    });

    document.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-remove-facet]");
      if (chip) {
        const key = chip.getAttribute("data-remove-facet");
        const value = chip.getAttribute("data-value");
        const patch = {};
        if (key === "q") patch.q = "";
        else if (key === "inStock") patch.inStock = false;
        else if (key === "onSale") patch.onSale = false;
        else if (key === "max") patch.max = 12000;
        else patch[key] = state[key].filter((v) => v !== value);
        update(patch);
      }
      if (e.target.closest("[data-action='clear-filters']")) {
        update({ categories: [], brands: [], collections: [], materials: [], colors: [],
                 min: 0, max: 12000, q: "", inStock: false, onSale: false });
      }
      const pageBtn = e.target.closest("[data-page]");
      if (pageBtn && !pageBtn.disabled) update({ page: parseInt(pageBtn.getAttribute("data-page"), 10) }, { scroll: true });
    });

    window.addEventListener("popstate", () => { readUrl(); render(); });
  }

  /* ------------------------------------------------------ instant search */
  function bindSearch() {
    const input = LX.$("#search-input");
    const out = LX.$("#search-results");
    if (!input || !out) return;

    const run = LX.debounce(function () {
      const q = input.value.trim();
      if (q.length < 2) {
        out.innerHTML = '<p class="muted" style="font-size:var(--step--1)">Start typing — the catalogue filters as you go.</p>' +
          '<div class="cluster" style="margin-top:1rem">' +
          ["Chronograph", "Diamond", "Wedding", "Under $500", "Titanium"].map((t) =>
            '<button class="chip" data-search-suggest="' + t + '">' + t + "</button>").join("") + "</div>";
        return;
      }
      const terms = q.toLowerCase().split(/\s+/);
      const hits = LX.data().products.filter((p) => {
        const hay = [p.name, p.brandName, p.category, p.collection, p.material, p.color, p.sku].join(" ").toLowerCase();
        return terms.every((t) => hay.indexOf(t) > -1);
      }).slice(0, 6);

      if (!hits.length) {
        out.innerHTML = '<div class="empty" style="padding:2rem"><h3>No matches for “' + LX.esc(q) + '”</h3>' +
          "<p>Try a material, a collection, or a price such as “under $800”.</p>" +
          '<a class="btn btn--secondary btn--sm" href="' + LX.url("pages/ai-assistant.html?q=" + encodeURIComponent(q)) +
          '">Ask the assistant instead</a></div>';
        return;
      }
      out.innerHTML = hits.map((p) =>
        '<a class="cart-line" style="grid-template-columns:60px 1fr auto;text-decoration:none" href="' +
          LX.url("pages/product.html?p=" + p.slug) + '">' +
          '<img src="' + LX.url(p.images[0]) + '" alt="" style="width:60px">' +
          "<div><h4 class='cart-line__name'>" + LX.esc(p.name) + "</h4>" +
          "<div class='cart-line__meta'>" + LX.esc(p.brandName) + " · " + LX.titleCase(p.category) + "</div></div>" +
          "<span class='price'>" + LX.money(LX.priceOf(p)) + "</span></a>").join("") +
        '<a class="btn btn--secondary btn--block" style="margin-top:1rem" href="' +
        LX.url("pages/shop.html?q=" + encodeURIComponent(q)) + '">See all results</a>';
    }, 160);

    input.addEventListener("input", run);
    run();

    document.addEventListener("click", (e) => {
      const s = e.target.closest("[data-search-suggest]");
      if (s) { input.value = s.getAttribute("data-search-suggest"); run(); input.focus(); }
    });
    const form = LX.$("#search-form");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      location.href = LX.url("pages/shop.html?q=" + encodeURIComponent(input.value.trim()));
    });
  }

  document.addEventListener("DOMContentLoaded", function () { bindShop(); bindSearch(); });
  LX.Catalog = { state, results, update, render };
})(window.LX);
