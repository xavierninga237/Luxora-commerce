/* =========================================================================
   Luxora Commerce — core utilities
   Loaded first. Everything else hangs off window.LX.
   ========================================================================= */
window.LX = window.LX || {};

(function (LX) {
  "use strict";

  /* ---------------------------------------------------------------- DOM */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (Array.isArray(children) ? children : children != null ? [children] : [])
      .forEach((c) => node.append(c instanceof Node ? c : document.createTextNode(c)));
    return node;
  }

  /* Escape anything that came from a person before it touches innerHTML. */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* --------------------------------------------------------- formatting */
  const money = (n, cents) =>
    "$" + Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0,
    });

  const compact = (n) =>
    Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
    : String(n);

  const dateLong = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US",
      { year: "numeric", month: "long", day: "numeric" });

  const dateShort = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US",
      { year: "numeric", month: "short", day: "numeric" });

  const titleCase = (s) => String(s).replace(/(^|[-\s])(\w)/g, (m) => m.toUpperCase()).replace(/-/g, " ");

  /* -------------------------------------------------------------- misc */
  function debounce(fn, wait) {
    let t; return function () {
      const args = arguments, ctx = this;
      clearTimeout(t); t = setTimeout(() => fn.apply(ctx, args), wait || 200);
    };
  }

  const params = () => new URLSearchParams(location.search);

  /* Pages sit at three depths (root, /pages, /admin). Links are written
     relative to the site root, so resolve them against that base. */
  function base() {
    const path = location.pathname;
    const depth = ["/pages/", "/admin/", "/auth/", "/account/"].some((d) => path.indexOf(d) > -1);
    return depth ? "../" : "";
  }
  const url = (rel) => base() + String(rel).replace(/^\//, "");

  /* ------------------------------------------------------------ storage */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem("luxora." + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("luxora." + key, JSON.stringify(value)); return true; }
      catch (e) { return false; }   // private mode, quota — fail quietly
    },
    remove(key) { try { localStorage.removeItem("luxora." + key); } catch (e) {} },
  };

  /* ------------------------------------------------------------- events */
  const bus = (function () {
    const map = {};
    return {
      on(name, fn) { (map[name] = map[name] || []).push(fn); return () => bus.off(name, fn); },
      off(name, fn) { map[name] = (map[name] || []).filter((f) => f !== fn); },
      emit(name, payload) { (map[name] || []).forEach((f) => f(payload)); },
    };
  })();

  /* ------------------------------------------------------------- toasts */
  function toast(title, detail, kind) {
    let stack = $(".toast-stack");
    if (!stack) { stack = el("div", { class: "toast-stack", role: "status", "aria-live": "polite" }); document.body.append(stack); }
    const node = el("div", { class: "toast" + (kind ? " toast--" + kind : "") },
      [el("div", { html: "<strong>" + esc(title) + "</strong>" + (detail ? "<span>" + esc(detail) + "</span>" : "") })]);
    stack.append(node);
    setTimeout(() => {
      node.classList.add("is-out");
      node.addEventListener("animationend", () => node.remove());
    }, 3400);
  }

  /* --------------------------------------------------------------- data */
  function data() {
    if (!window.LUXORA) {
      console.error("Luxora: data layer missing. Include assets/js/data/luxora-data.js first.");
      return { products: [], reviews: [], orders: [], customers: [], categories: [], collections: [], brands: [] };
    }
    return window.LUXORA;
  }

  const productBySlug = (slug) => data().products.filter((p) => p.slug === slug)[0] || null;
  const priceOf = (p) => (p.discountPrice || p.price);
  const reviewsFor = (slug) => data().reviews.filter((r) => r.slug === slug);

  const stars = (rating, count) => {
    let out = '<span class="stars" aria-label="' + rating + ' out of 5">';
    for (let i = 1; i <= 5; i++) {
      out += '<svg viewBox="0 0 24 24" class="' + (i <= Math.round(rating) ? "is-on" : "") +
        '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    if (count != null) out += '<span class="stars__count">(' + count + ")</span>";
    return out + "</span>";
  };

  /* The PWA manifest is only attached when the site is actually served over
     http(s). Browsers block manifest fetches on file:// as a cross-origin
     request, which produces a noisy (and harmless) console error when the
     site is opened by double-clicking index.html. */
  function attachManifest() {
    if (!/^https?:$/.test(location.protocol)) return;
    if (document.querySelector('link[rel="manifest"]')) return;
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = url("manifest.webmanifest");
    document.head.appendChild(link);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachManifest);
  } else {
    attachManifest();
  }

  Object.assign(LX, {
    $, $$, el, esc, money, compact, dateLong, dateShort, titleCase,
    debounce, params, url, store, bus, toast, data,
    productBySlug, priceOf, reviewsFor, stars,
  });
})(window.LX);
