/* =========================================================================
   Luxora Commerce — admin platform controllers
   Charts are drawn as inline SVG so the dashboard has no chart-library
   dependency and renders identically offline.
   ========================================================================= */
(function (LX) {
  "use strict";

  const GOLD = "#C9A14A";
  const GRID = "#2B2B2B";

  /* --------------------------------------------------------- chart tools */
  function lineChart(opts) {
    const { series, labels, height = 260, format = (v) => LX.compact(v) } = opts;
    const W = 720, H = height, pad = { t: 20, r: 16, b: 30, l: 52 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const all = series.reduce((a, s) => a.concat(s.data), []);
    const max = Math.max.apply(null, all) * 1.12, min = Math.min(0, Math.min.apply(null, all));
    const x = (i, n) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;

    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart" preserveAspectRatio="xMidYMid meet" role="img">';
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (ih / 4) * g;
      svg += '<line x1="' + pad.l + '" y1="' + gy + '" x2="' + (W - pad.r) + '" y2="' + gy + '" stroke="' + GRID + '" stroke-width="1"/>';
      svg += '<text x="' + (pad.l - 10) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#7D7D7D" font-size="10" font-family="Geist Mono,monospace">' +
        format(max - ((max - min) / 4) * g) + "</text>";
    }
    labels.forEach((lab, i) => {
      svg += '<text x="' + x(i, labels.length) + '" y="' + (H - 8) + '" text-anchor="middle" fill="#7D7D7D" font-size="10" font-family="Inter,sans-serif">' + lab + "</text>";
    });
    series.forEach((s) => {
      const pts = s.data.map((v, i) => x(i, s.data.length) + "," + y(v));
      const color = s.color || GOLD;
      if (s.fill) {
        svg += '<polygon points="' + pad.l + "," + (pad.t + ih) + " " + pts.join(" ") + " " + (W - pad.r) + "," + (pad.t + ih) +
          '" fill="' + color + '" opacity="0.08"/>';
      }
      svg += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      s.data.forEach((v, i) => {
        svg += '<circle cx="' + x(i, s.data.length) + '" cy="' + y(v) + '" r="3" fill="#111" stroke="' + color + '" stroke-width="1.5"/>';
      });
    });
    return svg + "</svg>";
  }

  function barChart(opts) {
    const { data, labels, height = 260, format = (v) => LX.compact(v) } = opts;
    const W = 720, H = height, pad = { t: 20, r: 16, b: 30, l: 52 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const max = Math.max.apply(null, data) * 1.12;
    const bw = iw / data.length * 0.58;
    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart" preserveAspectRatio="xMidYMid meet" role="img">' +
      '<defs><linearGradient id="barg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F2DFA8"/><stop offset="100%" stop-color="#8A6A22"/></linearGradient></defs>';
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (ih / 4) * g;
      svg += '<line x1="' + pad.l + '" y1="' + gy + '" x2="' + (W - pad.r) + '" y2="' + gy + '" stroke="' + GRID + '"/>' +
        '<text x="' + (pad.l - 10) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#7D7D7D" font-size="10" font-family="Geist Mono,monospace">' +
        format(max - (max / 4) * g) + "</text>";
    }
    data.forEach((v, i) => {
      const cx = pad.l + (iw / data.length) * (i + 0.5);
      const bh = (v / max) * ih;
      svg += '<rect x="' + (cx - bw / 2) + '" y="' + (pad.t + ih - bh) + '" width="' + bw + '" height="' + bh + '" rx="3" fill="url(#barg)"/>' +
        '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle" fill="#7D7D7D" font-size="10" font-family="Inter,sans-serif">' + labels[i] + "</text>";
    });
    return svg + "</svg>";
  }

  function donut(segments, size) {
    size = size || 200;
    const r = size / 2 - 16, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
    const total = segments.reduce((a, s) => a + s.value, 0);
    let offset = 0;
    const palette = [GOLD, "#8A6A22", "#7E858E", "#4B5157", "#2B2B2B"];
    let svg = '<svg viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img">';
    segments.forEach((s, i) => {
      const frac = s.value / total;
      const dash = frac * C;
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' +
        (s.color || palette[i % palette.length]) + '" stroke-width="20" stroke-dasharray="' + dash + " " + (C - dash) +
        '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + " " + cy + ')"/>';
      offset += dash;
    });
    svg += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" fill="#fff" font-size="26" font-family="Geist Mono,monospace">' + total + "%</text>";
    svg += '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" fill="#7D7D7D" font-size="10" font-family="Inter">of visits</text>';
    return svg + "</svg>";
  }

  function spark(data, color) {
    const W = 80, H = 28, max = Math.max.apply(null, data), min = Math.min.apply(null, data);
    const pts = data.map((v, i) => (i / (data.length - 1) * W) + "," + (H - ((v - min) / ((max - min) || 1)) * H)).join(" ");
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '"><polyline points="' + pts +
      '" fill="none" stroke="' + (color || GOLD) + '" stroke-width="1.5"/></svg>';
  }

  /* ------------------------------------------------------------ overview */
  function buildOverview() {
    if (!LX.$("#admin-overview")) return;
    const a = LX.data().analytics;
    const orders = LX.data().orders;

    const totalRev = a.revenue[a.revenue.length - 1];
    const revDelta = ((a.revenue[5] - a.revenue[4]) / a.revenue[4] * 100).toFixed(1);
    const ordDelta = ((a.orders[5] - a.orders[4]) / a.orders[4] * 100).toFixed(1);
    const conv = a.conversionRate[5];
    const aov = a.aov[5];

    LX.$("#admin-kpis").innerHTML = [
      kpi("Revenue", LX.money(totalRev), revDelta, a.revenue),
      kpi("Orders", a.orders[5].toLocaleString(), ordDelta, a.orders),
      kpi("Conversion", conv + "%", ((conv - a.conversionRate[4]) / a.conversionRate[4] * 100).toFixed(1), a.conversionRate),
      kpi("Avg. order value", LX.money(aov), ((aov - a.aov[4]) / a.aov[4] * 100).toFixed(1), a.aov),
    ].join("");

    const revChart = LX.$("#chart-revenue");
    if (revChart) revChart.innerHTML = lineChart({
      labels: a.months,
      series: [{ data: a.revenue, color: GOLD, fill: true }],
      format: (v) => "$" + LX.compact(v),
    });

    const ordChart = LX.$("#chart-orders");
    if (ordChart) ordChart.innerHTML = barChart({ labels: a.months, data: a.orders });

    const chChart = LX.$("#chart-channels");
    if (chChart) {
      chChart.innerHTML = donut(a.channels.map((c) => ({ label: c[0], value: c[1] })));
      LX.$("#legend-channels").innerHTML = a.channels.map((c, i) => {
        const palette = [GOLD, "#8A6A22", "#7E858E", "#4B5157", "#2B2B2B"];
        return "<span><i style='background:" + palette[i] + "'></i>" + c[0] + " · " + c[1] + "%</span>";
      }).join("");
    }

    const regions = LX.$("#chart-regions");
    if (regions) regions.innerHTML = LX.data().analytics.regions.map((r) =>
      '<div class="bar-row"><span>' + r[0] + "</span>" +
      '<span class="bar-row__track"><span class="bar-row__fill" style="width:' + r[1] + '%"></span></span>' +
      '<span class="bar-row__val">' + r[1] + "%</span></div>").join("");

    /* Top products by revenue contribution across seeded orders */
    const revByProduct = {};
    orders.forEach((o) => (o.items || []).forEach((i) => {
      revByProduct[i.slug] = (revByProduct[i.slug] || 0) + i.qty * i.unit;
    }));
    const top = Object.keys(revByProduct)
      .map((slug) => ({ p: LX.productBySlug(slug), rev: revByProduct[slug] }))
      .filter((x) => x.p).sort((a, b) => b.rev - a.rev).slice(0, 6);
    const topHost = LX.$("#admin-top-products");
    if (topHost) topHost.innerHTML = top.map((t) =>
      '<div class="cart-line" style="grid-template-columns:44px 1fr auto;padding:.6rem 0;border-color:var(--border)">' +
      '<img src="' + LX.url(t.p.images[0]) + '" alt="" style="width:44px;height:54px;object-fit:cover;border-radius:6px">' +
      "<div><b style='font-size:var(--step--1)'>" + LX.esc(t.p.name) + "</b>" +
      "<div class='muted' style='font-size:var(--step--2)'>" + LX.esc(t.p.brandName) + "</div></div>" +
      "<span class='mono' style='color:var(--lux-gold)'>" + LX.money(t.rev) + "</span></div>").join("");

    /* Recent orders */
    const recent = LX.$("#admin-recent-orders");
    if (recent) recent.innerHTML = orders.slice(0, 7).map((o) =>
      "<tr><td class='mono'>" + o.id + "</td><td>" + LX.esc(o.customer) + "</td>" +
      "<td>" + LX.dateShort(o.date) + "</td>" +
      "<td>" + statusPill(o.status) + "</td>" +
      "<td class='num'>" + LX.money(o.total) + "</td></tr>").join("");
  }

  function kpi(label, value, delta, series) {
    const up = parseFloat(delta) >= 0;
    return '<div class="kpi"><div class="kpi__label">' + label + "</div>" +
      '<div class="kpi__value">' + value + "</div>" +
      '<div class="kpi__delta ' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " " + Math.abs(delta) + "% vs last month</div>" +
      '<div class="kpi__spark">' + spark(series) + "</div></div>";
  }

  function statusPill(status) {
    const map = { Delivered: "ok", Shipped: "info", Processing: "info", Paid: "ok",
                  Pending: "warn", Cancelled: "bad", Refunded: "idle" };
    return '<span class="status-dot status-dot--' + (map[status] || "idle") + '"></span>' + status;
  }

  /* ------------------------------------------------------ generic table */
  function tableController(cfg) {
    const host = LX.$(cfg.mount);
    if (!host) return;
    if (cfg.actions) {
      const headRow = LX.$(cfg.mount + " thead tr");
      if (headRow && !headRow.querySelector(".th-actions")) headRow.insertAdjacentHTML("beforeend", "<th class='th-actions'>Actions</th>");
      const render = cfg.render;
      cfg.render = (r) => render(r).replace(/<\/tr>\s*$/, "<td class='td-actions'>" + rowActions(cfg.actions(r)) + "</td></tr>");
      cfg.cols += 1;
    }
    let rows = cfg.rows();
    let sortKey = cfg.defaultSort || null;
    let sortDir = -1;
    let query = "";
    let filter = "all";

    function apply() {
      let out = rows.slice();
      if (query) {
        const q = query.toLowerCase();
        out = out.filter((r) => cfg.search(r).toLowerCase().indexOf(q) > -1);
      }
      if (filter !== "all" && cfg.filter) out = out.filter((r) => cfg.filter(r, filter));
      if (sortKey) {
        out.sort((a, b) => {
          const va = cfg.sortValue(a, sortKey), vb = cfg.sortValue(b, sortKey);
          return (va > vb ? 1 : va < vb ? -1 : 0) * sortDir;
        });
      }
      return out;
    }

    function draw() {
      const out = apply();
      const body = LX.$(cfg.mount + " tbody");
      if (body) body.innerHTML = out.length
        ? out.map(cfg.render).join("")
        : "<tr><td colspan='" + cfg.cols + "' style='text-align:center;padding:3rem'>No matches</td></tr>";
      const counter = LX.$(cfg.counter);
      if (counter) counter.textContent = out.length + " of " + rows.length;
    }

    const search = LX.$(cfg.searchInput);
    if (search) search.addEventListener("input", LX.debounce((e) => { query = e.target.value; draw(); }, 160));

    LX.$$(cfg.mount + " .table__sort").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = -1; }
        LX.$$(cfg.mount + " .table__sort").forEach((x) => x.classList.remove("is-asc", "is-desc"));
        th.classList.add(sortDir === 1 ? "is-asc" : "is-desc");
        draw();
      });
    });

    if (cfg.filterSelect) {
      const sel = LX.$(cfg.filterSelect);
      if (sel) sel.addEventListener("change", (e) => { filter = e.target.value; draw(); });
    }

    draw();
    return { draw };
  }

  /* --------------------------------------------------------- products */
  function buildProducts() {
    tableController({
      mount: "#admin-products-table", counter: "#admin-products-count",
      searchInput: "#admin-products-search", filterSelect: "#admin-products-filter",
      cols: 7, defaultSort: null,
      actions: (p) => isPage("inventory")
        ? [["Restock", "Restock " + p.name], ["Adjust", "Adjust stock for " + p.name]]
        : [["Edit", "Edit " + p.name], ["Delete", "Delete " + p.name, "danger"]],
      rows: () => LX.data().products.slice(),
      search: (p) => p.name + " " + p.brandName + " " + p.sku + " " + p.category,
      filter: (p, f) => f === "low" ? p.stock > 0 && p.stock <= 5 : f === "out" ? p.stock === 0 : f === "sale" ? !!p.discountPrice : true,
      sortValue: (p, k) => k === "price" ? LX.priceOf(p) : k === "stock" ? p.stock : k === "rating" ? p.rating : p.name.toLowerCase(),
      render: (p) => {
        const pct = Math.min(100, p.stock / 60 * 100);
        const cls = p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "";
        return "<tr><td><div class='cell-product'><img src='" + LX.url(p.images[0]) + "' alt=''>" +
          "<div><b>" + LX.esc(p.name) + "</b><span>" + LX.esc(p.sku) + "</span></div></div></td>" +
          "<td>" + LX.esc(p.brandName) + "</td>" +
          "<td>" + LX.titleCase(p.category) + "</td>" +
          "<td class='num'>" + LX.money(LX.priceOf(p)) + "</td>" +
          "<td><div class='stock-meter'><span class='stock-meter__track'><span class='stock-meter__fill " + cls +
            "' style='width:" + pct + "%'></span></span><span class='num'>" + p.stock + "</span></div></td>" +
          "<td>" + LX.stars(p.rating) + "</td>" +
          "<td>" + (p.stock === 0 ? "<span class='badge badge--error'>Out</span>" :
            p.stock <= 5 ? "<span class='badge badge--warn'>Low</span>" : "<span class='badge badge--success'>OK</span>") + "</td></tr>";
      },
    });
  }

  /* ---------------------------------------------------------- orders */
  function buildOrders() {
    tableController({
      mount: "#admin-orders-table", counter: "#admin-orders-count",
      searchInput: "#admin-orders-search", filterSelect: "#admin-orders-filter",
      cols: 6, defaultSort: "date",
      actions: (o) => [["Update", "Update the status of order " + o.id], ["Refund", "Refund order " + o.id, "danger"]],
      rows: () => LX.data().orders.slice(),
      search: (o) => o.id + " " + o.customer + " " + o.email + " " + o.status,
      filter: (o, f) => o.status.toLowerCase() === f,
      sortValue: (o, k) => k === "total" ? o.total : k === "date" ? o.date : o.customer.toLowerCase(),
      render: (o) => "<tr><td class='mono'>" + o.id + "</td>" +
        "<td><b style='color:var(--text)'>" + LX.esc(o.customer) + "</b><div class='muted' style='font-size:var(--step--2)'>" + LX.esc(o.city) + ", " + o.country + "</div></td>" +
        "<td>" + LX.dateShort(o.date) + "</td>" +
        "<td>" + (o.items || []).length + " item" + ((o.items || []).length === 1 ? "" : "s") + "</td>" +
        "<td>" + statusPill(o.status) + "</td>" +
        "<td class='num'>" + LX.money(o.total) + "</td></tr>",
    });
  }

  /* -------------------------------------------------------- customers */
  function buildCustomers() {
    tableController({
      mount: "#admin-customers-table", counter: "#admin-customers-count",
      searchInput: "#admin-customers-search", filterSelect: "#admin-customers-filter",
      cols: 6, defaultSort: "spent",
      actions: (c) => [["Email", "Email " + c.name], ["Delete", "Delete the customer " + c.name, "danger"]],
      rows: () => LX.data().customers.slice(),
      search: (c) => c.name + " " + c.email + " " + c.city + " " + c.tier,
      filter: (c, f) => c.tier === f,
      sortValue: (c, k) => k === "spent" ? c.spent : k === "orders" ? c.orders : c.name.toLowerCase(),
      render: (c) => "<tr><td><div class='cell-product'><div class='avatar' style='width:38px;height:38px'>" + LX.esc(c.initials) +
        "</div><div><b>" + LX.esc(c.name) + "</b><span>" + LX.esc(c.email) + "</span></div></div></td>" +
        "<td>" + LX.esc(c.city) + ", " + c.country + "</td>" +
        "<td><span class='badge " + (c.tier === "Private Client" ? "" : "badge--muted") + "'>" + c.tier + "</span></td>" +
        "<td class='num'>" + c.orders + "</td>" +
        "<td class='num'>" + LX.money(c.spent) + "</td>" +
        "<td>" + LX.dateShort(c.joined) + "</td></tr>",
    });
  }

  /* -------------------------------------------------------- reviews/etc */
  function buildReviews() {
    const host = LX.$("#admin-reviews-table");
    if (!host) return;
    tableController({
      mount: "#admin-reviews-table", counter: "#admin-reviews-count",
      searchInput: "#admin-reviews-search", filterSelect: "#admin-reviews-filter",
      cols: 6, defaultSort: "date",
      actions: (r) => [["Approve", "Approve a review of " + r.product], ["Delete", "Delete a review by " + r.author, "danger"]],
      rows: () => LX.data().reviews.slice(),
      search: (r) => r.product + " " + r.author + " " + r.title,
      filter: (r, f) => r.status.toLowerCase() === f,
      sortValue: (r, k) => k === "rating" ? r.rating : r.date,
      render: (r) => "<tr><td>" + LX.esc(r.product) + "</td>" +
        "<td>" + LX.esc(r.author) + "</td>" +
        "<td>" + LX.stars(r.rating) + "</td>" +
        "<td style='max-width:280px'>" + LX.esc(r.title) + "</td>" +
        "<td>" + LX.dateShort(r.date) + "</td>" +
        "<td>" + (r.status === "Published" ? "<span class='badge badge--success'>Published</span>" :
          r.status === "Pending" ? "<span class='badge badge--warn'>Pending</span>" :
          "<span class='badge badge--error'>Flagged</span>") + "</td></tr>",
    });
  }

  function buildCoupons() {
    const host = LX.$("#admin-coupons-body");
    if (!host) return;
    host.innerHTML = LX.data().coupons.map((c) =>
      "<tr><td class='mono' style='color:var(--lux-gold)'>" + c.code + "</td>" +
      "<td>" + LX.esc(c.description) + "</td>" +
      "<td>" + (c.type === "percent" ? c.value + "%" : c.type === "fixed" ? LX.money(c.value) : "Free shipping") + "</td>" +
      "<td class='num'>" + c.uses + " / " + c.limit + "</td>" +
      "<td>" + LX.dateShort(c.expires) + "</td>" +
      "<td>" + (c.status === "Active" ? "<span class='badge badge--success'>Active</span>" :
        c.status === "Paused" ? "<span class='badge badge--warn'>Paused</span>" :
        "<span class='badge badge--muted'>Expired</span>") + "</td>" +
      "<td class='td-actions'>" + rowActions([["Edit", "Edit coupon " + c.code],
        [c.status === "Paused" ? "Resume" : "Pause", (c.status === "Paused" ? "Resume" : "Pause") + " coupon " + c.code],
        ["Delete", "Delete coupon " + c.code, "danger"]]) + "</td></tr>").join("");
    const headRow = host.closest("table") && host.closest("table").querySelector("thead tr");
    if (headRow && !headRow.querySelector(".th-actions")) headRow.insertAdjacentHTML("beforeend", "<th class='th-actions'>Actions</th>");
  }

  function buildAiConversations() {
    const host = LX.$("#admin-ai-log");
    if (!host) return;
    const a = LX.data().analytics;
    const chart = LX.$("#chart-ai");
    if (chart) chart.innerHTML = lineChart({
      labels: a.months, series: [{ data: a.aiUsage, color: GOLD, fill: true }],
    });
    const samples = [
      ["I need a wedding gift under $4000", "wedding · under $4,000", "Solitaire Diamond Ring"],
      ["Compare the Heritage Automatic and the GMT Traveler", "comparison", "GMT Traveler"],
      ["Something in titanium for my husband", "titanium · for him", "Titanium Sport Watch"],
      ["Gift for my mother, around $800", "for her · ~$800", "Pearl Necklace"],
      ["Executive watch, classic style", "executive · classic", "Heritage Automatic"],
      ["Rose gold, under $1500", "rose gold · under $1,500", "Rose Gold Infinity Ring"],
    ];
    host.innerHTML = samples.map((s) =>
      "<tr><td style='max-width:320px'>" + LX.esc(s[0]) + "</td>" +
      "<td><span class='badge badge--muted'>" + LX.esc(s[1]) + "</span></td>" +
      "<td>" + LX.esc(s[2]) + "</td>" +
      "<td class='num'>" + (Math.random() * 2 + 0.4).toFixed(1) + "s</td></tr>").join("");
  }

  /* ---------------------------------------------------------- demo mode */
  /* The admin is public for portfolio visitors: everything can be browsed,
     searched, sorted and filtered, but nothing can be changed. Any control
     that would write data carries data-admin-action and lands here instead. */
  function isPage(name) { return location.pathname.indexOf("/admin/" + name) > -1; }

  function rowActions(list) {
    return "<div class='row-actions'>" + list.map((a) =>
      "<button type='button' class='row-btn" + (a[2] === "danger" ? " row-btn--danger" : "") +
      "' data-admin-action='" + LX.esc(a[1]) + "'>" + LX.esc(a[0]) + "</button>").join("") + "</div>";
  }

  function demoNotice(action) {
    let modal = LX.$("#demo-modal");
    if (!modal) {
      modal = LX.el("div", { class: "modal", id: "demo-modal", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "demo-modal-title" });
      modal.innerHTML =
        '<div class="modal__panel demo-modal">' +
          '<button class="icon-btn modal__close" data-action="close-overlays" aria-label="Close">' + LX.icon("close", 17) + "</button>" +
          '<span class="demo-modal__seal" aria-hidden="true">' + LX.icon("lock", 22) + "</span>" +
          '<span class="eyebrow">Demo mode</span>' +
          '<h3 id="demo-modal-title">This admin is read-only</h3>' +
          '<p class="demo-modal__action" id="demo-modal-action"></p>' +
          "<p class='muted'>You are exploring a public portfolio demo of the Luxora back-office. " +
          "Products, orders, customers, reviews, coupons and settings can’t be created, edited or deleted here — " +
          "but search, sorting, filters and every chart are fully working.</p>" +
          '<div class="demo-modal__row">' +
            '<button class="btn btn--primary" data-action="close-overlays">Got it, keep exploring</button>' +
            '<a class="btn btn--ghost" href="' + LX.url("index.html") + '">Visit the storefront</a>' +
          "</div>" +
        "</div>";
      document.body.append(modal);
    }
    LX.$("#demo-modal-action").innerHTML = action
      ? "“" + LX.esc(action) + "” is disabled in this demo."
      : "Changes are disabled in this demo.";
    const scrim = LX.$(".scrim") || (function () {
      const s = LX.el("div", { class: "scrim", "data-action": "close-overlays" }); document.body.append(s); return s;
    })();
    modal.classList.add("is-open"); scrim.classList.add("is-open"); document.body.classList.add("is-locked");
    setTimeout(() => { const b = modal.querySelector(".btn--primary"); if (b) b.focus(); }, 80);
  }

  function bindDemoMode() {
    const main = LX.$(".admin__main");
    if (!main) return;
    document.documentElement.classList.add("is-demo");

    const top = LX.$(".admin__top", main);
    if (top && !LX.$(".demo-banner")) {
      top.insertAdjacentHTML("afterend",
        '<div class="demo-banner" role="status">' +
          '<span class="demo-banner__dot"></span>' +
          "<span><b>Demo mode</b> — public, read-only preview of the admin. Browse everything; changes are disabled.</span>" +
        "</div>");
    }

    const user = LX.$(".admin__user");
    if (user) user.innerHTML = '<div class="avatar" style="width:36px;height:36px">GV</div>' +
      "<div><b>Guest visitor</b><span>Read-only access</span></div>";

    /* Capture phase, so nothing further down the page ever sees the click. */
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-admin-action]");
      if (!btn) return;
      e.preventDefault(); e.stopImmediatePropagation();
      demoNotice(btn.getAttribute("data-admin-action"));
    }, true);
    document.addEventListener("submit", (e) => {
      if (!e.target.closest(".admin__main")) return;
      e.preventDefault(); demoNotice("Saving this form");
    }, true);
  }

  /* ---------------------------------------------------- sidebar toggle */
  function bindShell() {
    const burger = LX.$("#admin-burger");
    const side = LX.$(".admin__side");
    if (burger && side) {
      burger.addEventListener("click", () => side.classList.toggle("is-open"));
      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 1020 && side.classList.contains("is-open") &&
            !e.target.closest(".admin__side") && !e.target.closest("#admin-burger")) {
          side.classList.remove("is-open");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindShell();
    bindDemoMode();
    buildOverview();
    buildProducts();
    buildOrders();
    buildCustomers();
    buildReviews();
    buildCoupons();
    buildAiConversations();
  });

  LX.Admin = { lineChart, barChart, donut, demoNotice };
})(window.LX);
