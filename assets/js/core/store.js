/* =========================================================================
   Luxora Commerce — commerce state
   Cart, wishlist, comparison and recently viewed. Persisted to
   localStorage, published on a bus so every open view stays in step.
   ========================================================================= */
(function (LX) {
  "use strict";

  const FREE_SHIP_OVER = 500;
  const SHIPPING_FLAT  = 35;
  const TAX_RATE       = 0.08;
  const COMPARE_MAX    = 4;

  /* ------------------------------------------------------------------ cart */
  const Cart = {
    lines() { return LX.store.get("cart", []); },

    save(lines) {
      LX.store.set("cart", lines);
      LX.bus.emit("cart:change", lines);
      return lines;
    },

    add(slug, qty) {
      const product = LX.productBySlug(slug);
      if (!product) return false;
      if (product.stock === 0) {
        LX.toast("Out of stock", product.name + " is not available right now.", "error");
        return false;
      }
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const lines = Cart.lines();
      const found = lines.filter((l) => l.slug === slug)[0];
      const already = found ? found.qty : 0;

      if (already + qty > product.stock) {
        const left = product.stock - already;
        if (left <= 0) {
          LX.toast("Stock limit reached", "You already have every unit we hold of this piece.", "error");
          return false;
        }
        qty = left;
        LX.toast("Quantity adjusted", "Only " + left + " left in stock.", "error");
      }
      if (found) found.qty += qty; else lines.push({ slug: slug, qty: qty });
      Cart.save(lines);
      LX.toast("Added to bag", product.name);
      return true;
    },

    setQty(slug, qty) {
      qty = parseInt(qty, 10) || 0;
      let lines = Cart.lines();
      if (qty <= 0) return Cart.remove(slug);
      const product = LX.productBySlug(slug);
      if (product && qty > product.stock) {
        qty = product.stock;
        LX.toast("Quantity adjusted", "Only " + product.stock + " left in stock.", "error");
      }
      lines = lines.map((l) => (l.slug === slug ? { slug: slug, qty: qty } : l));
      return Cart.save(lines);
    },

    remove(slug) { return Cart.save(Cart.lines().filter((l) => l.slug !== slug)); },
    clear() { return Cart.save([]); },
    count() { return Cart.lines().reduce((n, l) => n + l.qty, 0); },

    /* Cart lines joined to live catalogue records, so a price or stock
       change is picked up rather than frozen at the moment of adding. */
    detailed() {
      return Cart.lines().map((l) => {
        const p = LX.productBySlug(l.slug);
        if (!p) return null;
        return { product: p, qty: l.qty, unit: LX.priceOf(p), line: LX.priceOf(p) * l.qty };
      }).filter(Boolean);
    },

    totals() {
      const items = Cart.detailed();
      const subtotal = items.reduce((n, i) => n + i.line, 0);
      const coupon = Coupons.applied();
      let discount = 0, freeShip = false;

      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.type === "percent") discount = Math.round(subtotal * coupon.value / 100);
        else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
        else if (coupon.type === "shipping") freeShip = true;
      }
      const after = Math.max(0, subtotal - discount);
      const shipping = items.length === 0 ? 0
        : (freeShip || after >= FREE_SHIP_OVER) ? 0 : SHIPPING_FLAT;
      const tax = Math.round(after * TAX_RATE);
      return {
        items: items, count: Cart.count(), subtotal: subtotal, discount: discount,
        shipping: shipping, tax: tax, total: after + shipping + tax,
        coupon: coupon, freeShipOver: FREE_SHIP_OVER,
        toFreeShipping: Math.max(0, FREE_SHIP_OVER - after),
      };
    },
  };

  /* --------------------------------------------------------------- coupons */
  const Coupons = {
    applied() {
      const code = LX.store.get("coupon", null);
      if (!code) return null;
      const c = (LX.data().coupons || []).filter((x) => x.code === code)[0];
      return c && c.status === "Active" ? c : null;
    },

    /* Returns a plain-language result so the caller never has to compose
       the failure message itself. */
    apply(code, subtotal) {
      code = String(code || "").trim().toUpperCase();
      if (!code) return { ok: false, message: "Enter a code to apply it." };
      const c = (LX.data().coupons || []).filter((x) => x.code === code)[0];
      if (!c) return { ok: false, message: "That code does not exist." };
      if (c.status === "Expired") return { ok: false, message: "That code expired on " + LX.dateShort(c.expires) + "." };
      if (c.status !== "Active") return { ok: false, message: "That code is not currently in use." };
      if (c.uses >= c.limit) return { ok: false, message: "That code has reached its usage limit." };
      if (subtotal != null && subtotal < c.minSpend) {
        return { ok: false, message: "Spend " + LX.money(c.minSpend) + " to use this code. You are " +
          LX.money(c.minSpend - subtotal) + " short." };
      }
      LX.store.set("coupon", c.code);
      LX.bus.emit("cart:change", Cart.lines());
      return { ok: true, coupon: c, message: c.description };
    },

    clear() { LX.store.remove("coupon"); LX.bus.emit("cart:change", Cart.lines()); },
  };

  /* -------------------------------------------------------------- wishlist */
  const Wishlist = {
    all() { return LX.store.get("wishlist", []); },
    has(slug) { return Wishlist.all().indexOf(slug) > -1; },
    toggle(slug) {
      const list = Wishlist.all();
      const i = list.indexOf(slug);
      const product = LX.productBySlug(slug);
      if (i > -1) { list.splice(i, 1); LX.toast("Removed from wishlist", product && product.name); }
      else { list.push(slug); LX.toast("Saved to wishlist", product && product.name); }
      LX.store.set("wishlist", list);
      LX.bus.emit("wishlist:change", list);
      return Wishlist.has(slug);
    },
    remove(slug) {
      LX.store.set("wishlist", Wishlist.all().filter((s) => s !== slug));
      LX.bus.emit("wishlist:change", Wishlist.all());
    },
    clear() { LX.store.set("wishlist", []); LX.bus.emit("wishlist:change", []); },
    count() { return Wishlist.all().length; },
  };

  /* --------------------------------------------------------------- compare */
  const Compare = {
    all() { return LX.store.get("compare", []); },
    has(slug) { return Compare.all().indexOf(slug) > -1; },
    toggle(slug) {
      const list = Compare.all();
      const i = list.indexOf(slug);
      if (i > -1) list.splice(i, 1);
      else {
        if (list.length >= COMPARE_MAX) {
          LX.toast("Comparison is full", "Remove a piece before adding another. Four is the maximum.", "error");
          return false;
        }
        list.push(slug);
      }
      LX.store.set("compare", list);
      LX.bus.emit("compare:change", list);
      return Compare.has(slug);
    },
    remove(slug) { LX.store.set("compare", Compare.all().filter((s) => s !== slug)); LX.bus.emit("compare:change", Compare.all()); },
    clear() { LX.store.set("compare", []); LX.bus.emit("compare:change", []); },
    count() { return Compare.all().length; },
    max: COMPARE_MAX,
  };

  /* -------------------------------------------------------------- history */
  const Recent = {
    all() { return LX.store.get("recent", []); },
    push(slug) {
      const list = Recent.all().filter((s) => s !== slug);
      list.unshift(slug);
      LX.store.set("recent", list.slice(0, 8));
    },
  };

  /* ---------------------------------------------------------- fake session */
  const Session = {
    user() { return LX.store.get("user", null); },
    signIn(email, name) {
      const user = {
        email: email,
        name: name || (email.split("@")[0] || "Guest").replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
        tier: "Circle",
        since: "2025",
      };
      LX.store.set("user", user);
      LX.bus.emit("session:change", user);
      return user;
    },
    signOut() { LX.store.remove("user"); LX.bus.emit("session:change", null); },
  };

  /* ------------------------------------------------------------- ordering */
  const Orders = {
    all() { return LX.store.get("orders", []); },

    /* Turns the current bag into a stored order and empties the bag. */
    place(details) {
      const t = Cart.totals();
      if (!t.items.length) return null;
      const order = {
        id: "LX-ORD-" + (20000 + Math.floor(Math.random() * 9000)),
        date: new Date().toISOString().slice(0, 10),
        status: "Paid",
        items: t.items.map((i) => ({
          slug: i.product.slug, name: i.product.name, sku: i.product.sku,
          qty: i.qty, unit: i.unit, image: i.product.images[0],
        })),
        subtotal: t.subtotal, discount: t.discount, shipping: t.shipping,
        tax: t.tax, total: t.total,
        coupon: t.coupon ? t.coupon.code : null,
        tracking: "LXW" + Math.floor(1e8 + Math.random() * 9e8),
        details: details || {},
      };
      const list = Orders.all();
      list.unshift(order);
      LX.store.set("orders", list);
      LX.store.set("lastOrder", order.id);
      Cart.clear();
      Coupons.clear();
      return order;
    },

    find(id) { return Orders.all().filter((o) => o.id === id)[0] || null; },
  };

  LX.Cart = Cart; LX.Coupons = Coupons; LX.Wishlist = Wishlist;
  LX.Compare = Compare; LX.Recent = Recent; LX.Session = Session; LX.Orders = Orders;
})(window.LX);
