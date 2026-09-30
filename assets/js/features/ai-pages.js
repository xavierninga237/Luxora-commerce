/* =========================================================================
   Luxora Commerce — AI page controllers + homepage assembly
   ========================================================================= */
(function (LX) {
  "use strict";

  function pickCard(p) {
    return '<a class="ai-pick" href="' + LX.url("pages/product.html?p=" + p.slug) + '">' +
      '<img src="' + LX.url(p.images[0]) + '" alt="' + LX.esc(p.name) + '">' +
      "<div><b>" + LX.esc(p.name) + "</b><span>" + LX.money(LX.priceOf(p)) + "</span></div></a>";
  }

  /* ------------------------------------------------------ chat assistant */
  function bindAssistant() {
    const log = LX.$("#chat-log");
    const form = LX.$("#chat-form");
    if (!log || !form) return;
    const input = LX.$("#chat-input");

    function bubble(role, html) {
      const me = role === "me";
      const node = LX.el("div", { class: "msg" + (me ? " msg--me" : "") });
      node.innerHTML =
        '<div class="msg__avatar">' + (me ? "You" : "L") + "</div>" +
        '<div class="msg__bubble">' + html + "</div>";
      log.append(node);
      log.scrollTop = log.scrollHeight;
      return node;
    }

    const history = [];
    let busy = false;

    function paragraphs(text) {
      return String(text).split(/\n{2,}|\n/).filter((t) => t.trim())
        .map((t) => "<p>" + LX.esc(t.trim()) + "</p>").join("");
    }

    function answer(text) {
      if (busy) return;
      busy = true;
      const typing = bubble("ai", '<span class="typing"><i></i><i></i><i></i></span>');
      const started = Date.now();
      LX.AI.replyLive(text, history).then((res) => {
        /* Keep the typing indicator up for a beat so instant local answers feel considered. */
        const wait = Math.max(0, 620 - (Date.now() - started));
        setTimeout(() => {
          let html = paragraphs(res.text);
          if (res.picks && res.picks.length) {
            html += '<div class="ai-picks">' + res.picks.map((r) => pickCard(r.product)).join("") + "</div>";
          }
          typing.querySelector(".msg__bubble").innerHTML = html;
          log.scrollTop = log.scrollHeight;
          history.push({ role: "user", content: text });
          history.push({ role: "assistant", content: res.text +
            (res.picks && res.picks.length ? " [Showed: " + res.picks.map((r) => r.product.name).join(", ") + "]" : "") });
          if (history.length > 12) history.splice(0, history.length - 12);
          busy = false;
        }, wait);
      });
    }

    /* Header badge: say honestly which brain is answering. */
    const badge = LX.$("#chat-mode");
    if (badge) LX.AI.liveStatus().then((st) => {
      badge.textContent = st.live ? "Live AI" + (st.model ? " · " + st.model.split("/").pop() : "") : "Runs on your device";
      badge.title = st.live ? "Answers come from " + st.model + " via OpenRouter, grounded in the Luxora catalogue."
        : "Answers come from the built-in recommendation engine. Add OPENROUTER_API_KEY on Vercel to go live.";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      bubble("me", LX.esc(q));
      input.value = "";
      answer(q);
    });

    LX.$$("[data-prompt]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-prompt");
        bubble("me", LX.esc(q));
        answer(q);
      }));

    /* Deep-link: /ai-assistant.html?q=... opens straight into an answer. */
    const seed = LX.params().get("q");
    bubble("ai", "<p>Welcome to the Luxora concierge. I can recommend pieces, compare two of them, " +
      "or answer anything about shipping, sizing and returns. What are you looking for?</p>");
    if (seed) { bubble("me", LX.esc(seed)); answer(seed); }
  }

  /* --------------------------------------------------------- gift finder */
  function bindGiftFinder() {
    const root = LX.$("#gift-finder");
    if (!root) return;
    const steps = LX.$$("[data-gift-step]", root);
    const answers = {};
    let idx = 0;

    function show(i) {
      idx = i;
      steps.forEach((s, k) => { s.hidden = k !== i; });
      const bar = LX.$("#gift-progress");
      if (bar) bar.style.width = ((i) / (steps.length - 1) * 100) + "%";
    }

    LX.$$("[data-gift-opt]", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.closest("[data-gift-step]").getAttribute("data-gift-key");
        answers[key] = btn.getAttribute("data-gift-opt");
        LX.$$('[data-gift-key="' + key + '"] [data-gift-opt]').forEach((b) => b.classList.remove("is-on"));
        btn.classList.add("is-on");
        if (idx < steps.length - 1) setTimeout(() => show(idx + 1), 180);
        else finish(answers);
      });
    });

    LX.$$("[data-gift-back]", root).forEach((b) =>
      b.addEventListener("click", () => show(Math.max(0, idx - 1))));

    function finish(a) {
      const out = LX.$("#gift-results");
      const { results, intent } = LX.AI.giftFind(a);
      LX.$("#gift-quiz").hidden = true;
      out.hidden = false;
      const summary = LX.AI.describeIntent(intent);
      out.innerHTML =
        "<div class='center' style='margin-bottom:2rem'>" +
          "<span class='eyebrow eyebrow--center'>Your matches</span>" +
          "<h2>Chosen for " + (a.recipient === "him" ? "him" : a.recipient === "her" ? "her" : "them") + "</h2>" +
          "<p class='lead' style='margin-inline:auto'>" +
          (summary ? "Based on " + LX.esc(summary) + ", these are the strongest fits." :
           "Here is where the concierge would start.") + "</p>" +
        "</div>" +
        (results.length
          ? '<div class="grid grid--3">' + results.map((r) => LX.productCard(r.product)).join("") + "</div>"
          : '<div class="empty"><h3>Nothing fit every answer</h3><p>Widen the budget and try again.</p></div>') +
        '<div class="center" style="margin-top:2rem"><button class="btn btn--secondary" id="gift-restart">Start over</button></div>';
      LX.revealScan(out);
      LX.syncCounters();
      const restart = LX.$("#gift-restart");
      if (restart) restart.addEventListener("click", () => {
        Object.keys(answers).forEach((k) => delete answers[k]);
        LX.$$("[data-gift-opt]").forEach((b) => b.classList.remove("is-on"));
        out.hidden = true; LX.$("#gift-quiz").hidden = false; show(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      window.scrollTo({ top: root.offsetTop - 100, behavior: "smooth" });
    }

    show(0);
  }

  /* ----------------------------------------------------------- compare */
  function renderComparePage() {
    const host = LX.$("#compare-view");
    if (!host) return;

    function draw() {
      const slugs = LX.Compare.all();
      const products = slugs.map(LX.productBySlug).filter(Boolean);

      if (products.length < 2) {
        host.innerHTML = '<div class="empty"><h3>Add at least two pieces to compare</h3>' +
          "<p>Open any product and choose “Add to comparison”, or add straight from the catalogue. " +
          "You can compare up to four at once.</p>" +
          '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
        return;
      }

      const rows = [
        ["", (p) => '<img src="' + LX.url(p.images[0]) + '" alt="' + LX.esc(p.name) + '"><b style="font-family:var(--font-display);font-size:1.2rem">' +
          LX.esc(p.name) + "</b>" +
          '<div style="margin-top:.5rem"><button class="btn btn--ghost btn--sm" data-action="compare" data-slug="' + p.slug + '">Remove</button></div>"'],
        ["Price", (p) => '<span class="price' + (p.discountPrice ? " price--now" : "") + '">' + LX.money(LX.priceOf(p)) + "</span>" +
          (p.discountPrice ? ' <span class="price--was">' + LX.money(p.price) + "</span>" : "")],
        ["Brand", (p) => LX.esc(p.brandName)],
        ["Collection", (p) => LX.titleCase(p.collection)],
        ["Material", (p) => LX.esc(p.material)],
        ["Rating", (p) => LX.stars(p.rating, p.reviewCount)],
        ["Weight", (p) => LX.esc(p.weight)],
        ["Availability", (p) => p.stock === 0 ? "Sold out" : p.stock <= 5 ? p.stock + " left" : "In stock"],
        ["Warranty", (p) => LX.esc(p.warranty)],
        ["", (p) => '<button class="btn btn--primary btn--sm btn--block" data-action="add" data-slug="' + p.slug + '"' +
          (p.stock === 0 ? " disabled" : "") + ">" + (p.stock === 0 ? "Sold out" : "Add to bag") + "</button>"],
      ];

      const best = { rating: Math.max.apply(null, products.map((p) => p.rating)),
                     price: Math.min.apply(null, products.map(LX.priceOf)) };

      let table = '<div class="table-wrap"><table class="compare-table"><tbody>';
      rows.forEach((row) => {
        table += "<tr><th>" + row[0] + "</th>";
        products.forEach((p) => {
          let cls = "";
          if (row[0] === "Rating" && p.rating === best.rating) cls = " class='is-best'";
          if (row[0] === "Price" && LX.priceOf(p) === best.price) cls = " class='is-best'";
          table += "<td" + cls + ">" + row[1](p) + "</td>";
        });
        table += "</tr>";
      });
      table += "</tbody></table></div>";

      const verdict = LX.AI.compare(products);
      let ai = "";
      if (verdict) {
        ai = '<div class="card" style="border-color:var(--gold-line);margin-top:2rem">' +
          '<div class="cluster" style="margin-bottom:1rem">' + LX.icon("spark", 18) +
          '<strong style="letter-spacing:.08em;text-transform:uppercase;color:var(--lux-gold);font-size:var(--step--1)">AI verdict</strong></div>' +
          "<p style='font-size:var(--step-1)'>" + LX.esc(verdict.verdict) + "</p>" +
          '<div class="grid grid--2" style="margin-top:1.5rem">' +
          verdict.notes.map((n) =>
            "<div><h4 style='margin-bottom:.5rem'>" + LX.esc(n.product.name) + "</h4>" +
            '<div style="font-size:var(--step--1)"><strong style="color:#7BC67E">For</strong><ul style="margin:.25rem 0 .75rem">' +
            n.pros.map((x) => "<li>" + LX.esc(x) + "</li>").join("") + "</ul>" +
            '<strong style="color:#FF8A80">Against</strong><ul style="margin:.25rem 0 0">' +
            n.cons.map((x) => "<li>" + LX.esc(x) + "</li>").join("") + "</ul></div></div>").join("") +
          "</div></div>";
      }
      host.innerHTML = table + ai;
      LX.syncCounters();
    }

    draw();
    LX.bus.on("compare:change", draw);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindAssistant();
    bindGiftFinder();
    renderComparePage();
  });
})(window.LX);
