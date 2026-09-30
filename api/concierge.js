/* =========================================================================
   Luxora Commerce — AI concierge endpoint (Vercel serverless function)

   POST /api/concierge  { message, history? }  ->  { text, picks: [slug…] }
   GET  /api/concierge                          ->  { live, model }

   The OpenRouter key never reaches the browser. Configure it in
   Vercel → Project → Settings → Environment Variables:

     OPENROUTER_API_KEY   required  sk-or-v1-…
     OPENROUTER_MODEL     optional  any OpenRouter model id (default below)
     OPENROUTER_SITE_URL  optional  your deployed URL, sent as HTTP-Referer
     OPENROUTER_APP_NAME  optional  shown in your OpenRouter dashboard

   If the key is missing or the call fails, the browser falls back to the
   on-device recommendation engine, so the concierge never goes dark.
   ========================================================================= */
"use strict";

const products = require("../data/products.json");
const luxora = require("../data/luxora.json");

const COUPONS = (luxora.coupons || []).filter((c) => c.status === "Active").map((c) =>
  c.code + " (" + (c.type === "percent" ? c.value + "% off" : c.type === "fixed" ? "$" + c.value + " off" : "free shipping") +
  (c.minSpend ? ", min. spend $" + c.minSpend : "") + ")").join(", ");

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const MAX_MESSAGE = 600;
const MAX_HISTORY = 8;
const TIMEOUT_MS = 25000;

/* Best-effort per-instance rate limit: plenty for a portfolio demo, and it
   stops one visitor from burning through your OpenRouter credit. */
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const env = (k) => (process.env[k] || "").trim();

/* One compact line per product keeps the whole catalogue in context. */
const CATALOGUE = products.map((p) => {
  const price = p.discountPrice ? "$" + p.discountPrice + " (was $" + p.price + ")" : "$" + p.price;
  const flags = [
    p.bestseller && "bestseller", p.newArrival && "new", p.limitedEdition && "limited",
    p.stock === 0 ? "SOLD OUT" : p.stock <= 5 ? "only " + p.stock + " left" : "",
  ].filter(Boolean).join(", ");
  return [p.slug, p.name, p.brandName, p.category, p.material, p.collection + " collection",
    price, p.rating + "★/" + p.reviewCount, flags].filter(Boolean).join(" | ") +
    " — " + p.shortDescription;
}).join("\n");

const SLUGS = new Set(products.map((p) => p.slug));

const SYSTEM = `You are the Luxora Concierge, the shopping assistant for Luxora Commerce, a luxury watch and fine-jewellery house.
This is a portfolio demonstration store: products are fictional and no real orders are taken. If someone tries to buy, point them to the product page and cart, which run as a demo.

Voice: warm, assured and brief, like a senior boutique adviser. Two to four sentences. No emoji, no markdown, no bullet lists.

Rules:
- Recommend ONLY pieces from the catalogue below, and never invent products, prices or specifications.
- Respect budgets strictly (use the current price). Avoid sold-out pieces unless asked.
- Explain in a few words why each pick fits (occasion, recipient, material, budget, rating).
- Recommend 0 to 4 pieces. For policy or general questions, recommend none.
- If a request is off-topic, steer politely back to watches and jewellery.

Store policies:
- Shipping: free insured express over $500, otherwise $35. Most pieces ship in 1–4 business days; signature required.
- Returns: 30 days, free, if unworn with certificate. Engraved and resized pieces are final sale.
- Warranty: 2-year international warranty. Mechanical watches: service every 5 years.
- Sizing: rings 48–66, first resize free within 90 days. Bracelets ship with removable links.
- Active demo coupon codes: ${COUPONS}.

Reply with a single JSON object and nothing else:
{"text": "<your reply>", "picks": ["<slug>", ...]}

Catalogue (slug | name | brand | category | material | collection | price | rating | notes — description):
${CATALOGUE}`;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

/* Models do not always honour "JSON only", so parse defensively. */
function parseModelReply(content) {
  const raw = String(content || "").trim();
  let obj = null;
  try { obj = JSON.parse(raw); } catch (_) {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { obj = JSON.parse(m[0]); } catch (_) { obj = null; } }
  }
  let text = obj && typeof obj.text === "string" ? obj.text : raw.replace(/```(json)?/g, "");
  let picks = obj && Array.isArray(obj.picks) ? obj.picks : [];
  picks = picks.map(String).filter((s) => SLUGS.has(s));
  if (!picks.length) {
    /* Fall back to spotting product names the model mentioned. */
    const lower = text.toLowerCase();
    picks = products.filter((p) => lower.indexOf(p.name.toLowerCase()) > -1).map((p) => p.slug);
  }
  text = text.replace(/\*\*|__|^#+\s*/gm, "").trim();
  return { text: text.slice(0, 1500), picks: Array.from(new Set(picks)).slice(0, 4) };
}

module.exports = async function handler(req, res) {
  const key = env("OPENROUTER_API_KEY");
  const model = env("OPENROUTER_MODEL") || DEFAULT_MODEL;

  if (req.method === "GET") return send(res, 200, { live: !!key, model: key ? model : null });
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return send(res, 405, { error: "method_not_allowed" }); }
  if (!key) return send(res, 503, { error: "not_configured" });

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "anon").split(",")[0].trim();
  if (limited(ip)) return send(res, 429, { error: "rate_limited" });

  let body;
  try { body = await readBody(req); } catch (_) { return send(res, 400, { error: "bad_json" }); }

  const message = String(body.message || "").trim().slice(0, MAX_MESSAGE);
  if (!message) return send(res, 400, { error: "empty_message" });

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": env("OPENROUTER_SITE_URL") || "https://" + (req.headers.host || "luxora.example"),
        "X-Title": env("OPENROUTER_APP_NAME") || "Luxora Commerce",
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.4,
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM }].concat(history, [{ role: "user", content: message }]),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("OpenRouter error", r.status, data && data.error);
      return send(res, 502, { error: "upstream", status: r.status });
    }
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) return send(res, 502, { error: "empty_upstream" });
    return send(res, 200, Object.assign(parseModelReply(content), { model: data.model || model }));
  } catch (err) {
    console.error("Concierge failure", err && err.name, err && err.message);
    return send(res, err && err.name === "AbortError" ? 504 : 500, { error: "failed" });
  } finally {
    clearTimeout(timer);
  }
};
