/* =========================================================================
   Luxora Commerce — cart page and checkout flow
   ========================================================================= */
(function (LX) {
  "use strict";

  /* ------------------------------------------------------------- cart page */
  function renderCartPage() {
    const host = LX.$("#cart-lines");
    if (!host) return;
    const t = LX.Cart.totals();

    if (!t.items.length) {
      LX.$("#cart-wrap").innerHTML =
        '<div class="empty"><h3>Your bag is empty</h3>' +
        "<p>When you add pieces they will be collected here, held for seven days.</p>" +
        '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
      return;
    }

    host.innerHTML = t.items.map((i) =>
      '<div class="cart-line">' +
        '<a href="' + LX.url("pages/product.html?p=" + i.product.slug) + '">' +
          '<img src="' + LX.url(i.product.images[0]) + '" alt="' + LX.esc(i.product.name) + '"></a>' +
        "<div>" +
          '<h3 class="cart-line__name">' + LX.esc(i.product.name) + "</h3>" +
          '<div class="cart-line__meta">' + LX.esc(i.product.brandName) + " · " + LX.esc(i.product.material) + " · " + LX.esc(i.product.sku) + "</div>" +
          '<div class="cluster" style="margin-top:.75rem">' +
            '<div class="qty">' +
              '<button data-action="qty-down" data-slug="' + i.product.slug + '" aria-label="Reduce quantity">−</button>' +
              '<input type="number" value="' + i.qty + '" min="1" max="' + i.product.stock +
                '" data-action="qty-set" data-slug="' + i.product.slug + '" aria-label="Quantity">' +
              '<button data-action="qty-up" data-slug="' + i.product.slug + '" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<button class="btn btn--ghost btn--sm" data-action="remove" data-slug="' + i.product.slug + '">Remove</button>' +
            '<button class="btn btn--ghost btn--sm" data-action="wishlist" data-slug="' + i.product.slug + '">Save for later</button>' +
          "</div>" +
        "</div>" +
        '<div style="text-align:right"><div class="price">' + LX.money(i.line) + "</div>" +
          (i.qty > 1 ? '<div class="muted" style="font-size:var(--step--2)">' + LX.money(i.unit) + " each</div>" : "") +
        "</div>" +
      "</div>").join("");

    renderSummary("#cart-summary", t, true);
  }

  function renderSummary(target, t, withCoupon) {
    const host = LX.$(target);
    if (!host) return;
    host.innerHTML =
      '<div class="card">' +
        "<h3 style='font-size:1.4rem'>Order summary</h3>" +
        (withCoupon ?
          '<div class="coupon-row" style="margin:1rem 0">' +
            '<input class="input" id="coupon-input" placeholder="Discount code" value="' + (t.coupon ? t.coupon.code : "") + '">' +
            '<button class="btn btn--secondary" id="coupon-apply">Apply</button>' +
          "</div>" +
          '<div id="coupon-msg" class="field__hint"></div>' : "") +
        '<div class="summary__row"><span>Subtotal</span><span class="mono">' + LX.money(t.subtotal) + "</span></div>" +
        (t.discount ? '<div class="summary__row"><span>Discount (' + t.coupon.code + ")</span><span class='mono' style='color:var(--lux-gold)'>−" + LX.money(t.discount) + "</span></div>" : "") +
        '<div class="summary__row"><span>Shipping</span><span class="mono">' + (t.shipping ? LX.money(t.shipping) : "Free") + "</span></div>" +
        '<div class="summary__row"><span>Tax (est.)</span><span class="mono">' + LX.money(t.tax) + "</span></div>" +
        '<div class="summary__row summary__row--total"><span>Total</span><span>' + LX.money(t.total) + "</span></div>" +
        (t.toFreeShipping > 0
          ? '<p class="field__hint" style="margin-top:.75rem">Add ' + LX.money(t.toFreeShipping) + " for free express shipping.</p>"
          : '<p class="field__hint text-gold" style="margin-top:.75rem">Free express shipping applied.</p>') +
        '<a class="btn btn--primary btn--block" style="margin-top:1rem" href="' + LX.url("pages/checkout.html") + '">Proceed to checkout</a>' +
        '<div class="cluster" style="justify-content:center;margin-top:1rem;gap:.5rem">' +
          LX.icon("lock", 14) + '<span class="muted" style="font-size:var(--step--2)">Secure checkout · Stripe</span></div>' +
      "</div>";

    if (withCoupon) {
      const apply = LX.$("#coupon-apply");
      const input = LX.$("#coupon-input");
      const msg = LX.$("#coupon-msg");
      const run = () => {
        const res = LX.Coupons.apply(input.value, t.subtotal);
        msg.textContent = res.message;
        msg.style.color = res.ok ? "var(--success)" : "#FF8A80";
        if (res.ok) LX.toast("Code applied", res.coupon.description);
      };
      if (apply) apply.addEventListener("click", run);
      if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
    }
  }

  /* -------------------------------------------------------------- checkout */
  const checkout = { step: 1, data: {} };

  function goStep(n) {
    checkout.step = n;
    LX.$$("[data-step]").forEach((s) => {
      const i = +s.getAttribute("data-step");
      s.classList.toggle("is-on", i === n);
      s.classList.toggle("is-done", i < n);
    });
    LX.$$("[data-step-panel]").forEach((p) => {
      p.hidden = +p.getAttribute("data-step-panel") !== n;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate(panel) {
    let ok = true;
    LX.$$("[required]", panel).forEach((field) => {
      const wrap = field.closest(".field");
      const valid = field.type === "checkbox" ? field.checked : field.value.trim() !== "";
      const emailOk = field.type !== "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value);
      if (!valid || !emailOk) { ok = false; if (wrap) wrap.classList.add("has-error"); }
      else if (wrap) wrap.classList.remove("has-error");
    });
    if (!ok) LX.toast("Check the highlighted fields", "A few details are missing or malformed.", "error");
    return ok;
  }

  function collect(panel) {
    LX.$$("input, select, textarea", panel).forEach((f) => {
      if (f.name) checkout.data[f.name] = f.type === "checkbox" ? f.checked : f.value;
    });
  }

  function renderCheckout() {
    const host = LX.$("#checkout");
    if (!host) return;
    const t = LX.Cart.totals();
    if (!t.items.length) {
      host.innerHTML = '<div class="empty"><h3>Your bag is empty</h3>' +
        "<p>There is nothing to check out yet.</p>" +
        '<a class="btn btn--primary" href="' + LX.url("pages/shop.html") + '">Browse the collection</a></div>';
      return;
    }

    LX.$("#checkout-items").innerHTML = t.items.map((i) =>
      '<div class="cart-line" style="grid-template-columns:56px 1fr auto;padding:.75rem 0">' +
        '<img src="' + LX.url(i.product.images[0]) + '" alt="" style="width:56px">' +
        "<div><h4 class='cart-line__name' style='font-size:1rem'>" + LX.esc(i.product.name) + "</h4>" +
        "<div class='cart-line__meta'>Qty " + i.qty + "</div></div>" +
        "<span class='price'>" + LX.money(i.line) + "</span></div>").join("");
    renderSummary("#checkout-summary", t, false);

    goStep(1);

    LX.$("#to-shipping") && LX.$("#to-shipping").addEventListener("click", () => {
      const panel = LX.$("[data-step-panel='1']");
      if (validate(panel)) { collect(panel); goStep(2); }
    });
    LX.$("#to-payment") && LX.$("#to-payment").addEventListener("click", () => {
      const panel = LX.$("[data-step-panel='2']");
      if (validate(panel)) { collect(panel); goStep(3); }
    });
    LX.$$("[data-back-step]").forEach((b) =>
      b.addEventListener("click", () => goStep(+b.getAttribute("data-back-step"))));

    LX.$$(".pay-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        LX.$$(".pay-option").forEach((o) => o.classList.remove("is-on"));
        opt.classList.add("is-on");
        const radio = LX.$("input", opt);
        if (radio) radio.checked = true;
        checkout.data.payment = opt.getAttribute("data-pay");
      });
    });

    const place = LX.$("#place-order");
    if (place) place.addEventListener("click", () => {
      const panel = LX.$("[data-step-panel='3']");
      if (!validate(panel)) return;
      collect(panel);
      place.classList.add("is-disabled");
      place.textContent = "Processing…";
      setTimeout(() => {
        const order = LX.Orders.place(checkout.data);
        if (order) location.href = LX.url("pages/order-confirmation.html?id=" + order.id);
      }, 900);
    });
  }

  /* --------------------------------------------------- confirmation page */
  function renderConfirmation() {
    const host = LX.$("#confirmation");
    if (!host) return;
    const id = LX.params().get("id") || LX.store.get("lastOrder");
    const order = id ? LX.Orders.find(id) : null;
    if (!order) {
      host.innerHTML = '<div class="empty"><h3>No order to show</h3>' +
        '<p>We could not find that order reference.</p><a class="btn btn--primary" href="' +
        LX.url("index.html") + '">Return home</a></div>';
      return;
    }
    const name = (order.details && order.details.firstName) || (LX.Session.user() && LX.Session.user().name.split(" ")[0]) || "there";
    host.innerHTML =
      '<div class="center" style="max-width:640px;margin-inline:auto">' +
        '<div class="rule"><i></i></div>' +
        '<div style="width:64px;height:64px;border-radius:50%;border:1px solid var(--gold-line);display:grid;place-items:center;margin:0 auto 1.5rem;color:var(--lux-gold)">' +
          LX.icon("check", 28) + "</div>" +
        "<span class='eyebrow eyebrow--center'>Order confirmed</span>" +
        "<h1>Thank you, " + LX.esc(name) + ".</h1>" +
        "<p class='lead' style='margin-inline:auto'>Your order <strong class='mono' style='color:var(--lux-gold)'>" + order.id +
        "</strong> is confirmed. A receipt is on its way to your inbox, and you can follow the parcel from your account.</p>" +
      "</div>" +
      '<div class="card" style="max-width:640px;margin:2rem auto 0">' +
        order.items.map((i) =>
          '<div class="cart-line" style="grid-template-columns:56px 1fr auto;padding:.75rem 0">' +
          '<img src="' + LX.url(i.image) + '" alt="" style="width:56px">' +
          "<div><h4 class='cart-line__name' style='font-size:1rem'>" + LX.esc(i.name) + "</h4>" +
          "<div class='cart-line__meta'>Qty " + i.qty + "</div></div>" +
          "<span class='price'>" + LX.money(i.unit * i.qty) + "</span></div>").join("") +
        '<div class="summary__row summary__row--total"><span>Total paid</span><span>' + LX.money(order.total) + "</span></div>" +
      "</div>" +
      '<div class="cluster" style="justify-content:center;margin-top:2rem">' +
        '<a class="btn btn--primary" href="' + LX.url("account/orders.html") + '">Track this order</a>' +
        '<a class="btn btn--secondary" href="' + LX.url("pages/shop.html") + '">Continue shopping</a>' +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCartPage();
    renderCheckout();
    renderConfirmation();
    LX.bus.on("cart:change", () => { renderCartPage(); });
  });
})(window.LX);
