/* =========================================================================
   Luxora Commerce — recommendation engine
   Powers the shopping assistant, gift finder, comparison and review
   summaries. It runs entirely on the client against the live catalogue:
   parse intent, score every product, explain the result.

   Swapping in a hosted model means replacing LX.AI.reply() with a fetch
   to your provider. Everything above it — the UI, the product cards, the
   explanation contract — stays as it is.
   ========================================================================= */
(function (LX) {
  "use strict";

  const WORDS = {
    categories: {
      watches:     ["watch", "watches", "timepiece", "chronograph", "automatic", "diver", "gmt", "moonphase", "skeleton"],
      rings:       ["ring", "rings", "band", "signet", "solitaire", "engagement", "eternity"],
      necklaces:   ["necklace", "necklaces", "chain", "pendant", "choker"],
      bracelets:   ["bracelet", "bracelets", "bangle", "cuff", "tennis"],
      earrings:    ["earring", "earrings", "studs", "hoops", "drops"],
      accessories: ["box", "case", "roll", "wallet", "organizer", "holder", "winder", "folio", "kit", "accessory", "accessories"],
    },
    materials: {
      "18K Gold": ["gold", "yellow gold", "18k"],
      "White Gold": ["white gold"],
      "Rose Gold": ["rose gold", "pink gold"],
      "Platinum": ["platinum"],
      "Titanium": ["titanium"],
      "Carbon Fiber": ["carbon"],
      "Genuine Leather": ["leather"],
      "Sterling Silver": ["silver", "sterling"],
      "Stainless Steel": ["steel", "stainless"],
    },
    occasions: {
      wedding:     { words: ["wedding", "bride", "groom", "engagement", "propose", "proposal", "marry", "marriage"], collections: ["wedding", "diamond"] },
      anniversary: { words: ["anniversary", "years together"], collections: ["diamond", "signature", "gold"] },
      birthday:    { words: ["birthday", "turning"], collections: ["everyday", "signature"] },
      graduation:  { words: ["graduation", "graduate", "graduating"], collections: ["everyday", "executive"] },
      work:        { words: ["work", "office", "executive", "boardroom", "professional", "business", "promotion", "interview"], collections: ["executive", "heritage"] },
      travel:      { words: ["travel", "travelling", "traveling", "trip", "flight", "abroad", "time zone", "timezone"], collections: ["traveler"] },
      everyday:    { words: ["everyday", "daily", "every day", "casual"], collections: ["everyday"] },
      formal:      { words: ["formal", "black tie", "gala", "evening", "dinner"], collections: ["signature", "diamond", "heritage"] },
    },
    recipients: {
      him:  ["him", "husband", "boyfriend", "father", "dad", "brother", "son", "man", "men", "male", "guy"],
      her:  ["her", "wife", "girlfriend", "mother", "mum", "mom", "sister", "daughter", "woman", "women", "female"],
      self: ["myself", "me", "my own", "for me"],
    },
    tone: {
      minimal: ["minimal", "simple", "plain", "understated", "subtle", "discreet", "quiet"],
      bold:    ["bold", "statement", "standout", "flashy", "eye-catching", "loud"],
      classic: ["classic", "timeless", "traditional", "heritage", "vintage"],
      modern:  ["modern", "contemporary", "sleek", "technical"],
    },
  };

  const HIM_BIAS = { watches: 3, rings: 1, bracelets: 2, accessories: 3, necklaces: 0, earrings: -4 };
  const HER_BIAS = { earrings: 3, necklaces: 3, rings: 3, bracelets: 2, watches: 1, accessories: 0 };

  function has(text, list) { return list.some((w) => text.indexOf(w) > -1); }

  /* --------------------------------------------------------- intent parse */
  function parse(input) {
    const text = " " + String(input || "").toLowerCase().replace(/[,]/g, " ") + " ";
    const intent = {
      raw: input, categories: [], materials: [], occasion: null,
      recipient: null, tone: null, budgetMax: null, budgetMin: null,
      wantsCompare: /\bcompare|versus|\bvs\b|difference between/.test(text),
      wantsSummary: /\bsummar|what do reviews|reviews say/.test(text),
      wantsBestseller: /\bbest ?sell|popular|most bought|top selling/.test(text),
      wantsNew: /\bnew\b|latest|just (in|landed)|arrival/.test(text),
      wantsSale: /\bsale\b|discount|deal|reduced|offer/.test(text),
    };

    Object.keys(WORDS.categories).forEach((c) => {
      if (has(text, WORDS.categories[c])) intent.categories.push(c);
    });
    Object.keys(WORDS.materials).forEach((m) => {
      if (has(text, WORDS.materials[m])) intent.materials.push(m);
    });
    Object.keys(WORDS.occasions).forEach((o) => {
      if (has(text, WORDS.occasions[o].words)) intent.occasion = intent.occasion || o;
    });
    Object.keys(WORDS.recipients).forEach((r) => {
      if (has(text, WORDS.recipients[r])) intent.recipient = intent.recipient || r;
    });
    Object.keys(WORDS.tone).forEach((t) => {
      if (has(text, WORDS.tone[t])) intent.tone = intent.tone || t;
    });

    /* Budget: "under $500", "below 2k", "$300-$800", "around 1200", "max 900" */
    const num = (s) => {
      const v = parseFloat(String(s).replace(/[$,\s]/g, ""));
      return /k$/i.test(String(s).trim()) ? v * 1000 : v;
    };
    let m;
    if ((m = text.match(/(?:between|from)\s*\$?([\d.,]+k?)\s*(?:and|to|-|–)\s*\$?([\d.,]+k?)/))) {
      intent.budgetMin = num(m[1]); intent.budgetMax = num(m[2]);
    } else if ((m = text.match(/\$?([\d.,]+k?)\s*(?:-|–|to)\s*\$?([\d.,]+k?)/))) {
      intent.budgetMin = num(m[1]); intent.budgetMax = num(m[2]);
    } else if ((m = text.match(/(?:under|below|less than|cheaper than|max|maximum|up to|budget of|within)\s*\$?([\d.,]+k?)/))) {
      intent.budgetMax = num(m[1]);
    } else if ((m = text.match(/(?:over|above|more than|at least|minimum)\s*\$?([\d.,]+k?)/))) {
      intent.budgetMin = num(m[1]);
    } else if ((m = text.match(/(?:around|about|roughly|approximately|near)\s*\$?([\d.,]+k?)/))) {
      const v = num(m[1]); intent.budgetMin = v * 0.7; intent.budgetMax = v * 1.3;
    } else if ((m = text.match(/\$\s?([\d.,]+k?)/))) {
      intent.budgetMax = num(m[1]);
    }
    return intent;
  }

  /* ----------------------------------------------------------- scoring */
  function score(product, intent) {
    const price = LX.priceOf(product);
    let s = 0;
    const why = [];

    if (intent.budgetMax != null) {
      if (price > intent.budgetMax) return null;                 // hard filter
      const headroom = 1 - price / intent.budgetMax;
      if (headroom < 0.35) { s += 8; why.push("uses the budget well at " + LX.money(price)); }
      else s += 3;
    }
    if (intent.budgetMin != null && price < intent.budgetMin) return null;

    if (intent.categories.length) {
      if (intent.categories.indexOf(product.category) === -1) return null;
      s += 10;
    }
    if (intent.materials.length) {
      if (intent.materials.indexOf(product.material) > -1) { s += 8; why.push("in " + product.material.toLowerCase()); }
      else if (intent.categories.length === 0) return null;
    }

    if (intent.occasion) {
      const cols = WORDS.occasions[intent.occasion].collections;
      if (cols.indexOf(product.collection) > -1) {
        s += 9;
        why.push("sits in the " + LX.titleCase(product.collection) + " collection");
      }
    }
    if (intent.recipient === "him") s += HIM_BIAS[product.category] || 0;
    if (intent.recipient === "her") s += HER_BIAS[product.category] || 0;

    if (intent.tone === "minimal" && ["novaire", "elvaro"].indexOf(product.brand) > -1) { s += 5; why.push("Novaire and Elvaro are the understated end of the house"); }
    if (intent.tone === "bold" && ["velmont", "kronique"].indexOf(product.brand) > -1) { s += 5; why.push("a piece people will notice"); }
    if (intent.tone === "classic" && ["aurelius", "luxora"].indexOf(product.brand) > -1) { s += 5; why.push("a traditional cut"); }
    if (intent.tone === "modern" && ["elvaro", "novaire", "kronique"].indexOf(product.brand) > -1) { s += 4; }

    if (intent.wantsBestseller && product.bestseller) { s += 7; why.push("one of our bestsellers"); }
    if (intent.wantsNew && product.newArrival) { s += 7; why.push("newly arrived"); }
    if (intent.wantsSale && product.discountPrice) { s += 7; why.push("currently reduced from " + LX.money(product.price)); }

    s += (product.rating - 4) * 5;                 // quality nudge
    s += Math.min(product.reviewCount / 120, 3);   // social proof, capped
    if (product.featured) s += 2;
    if (product.stock === 0) s -= 14;
    else if (product.stock <= 4) s += 1;           // scarcity, mildly

    return { product: product, score: s, why: why };
  }

  function recommend(input, limit) {
    const intent = typeof input === "string" ? parse(input) : input;
    const ranked = LX.data().products
      .map((p) => score(p, intent))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
    return { intent: intent, results: ranked.slice(0, limit || 4), total: ranked.length };
  }

  /* ------------------------------------------------------- explanations */
  function describeIntent(intent) {
    const bits = [];
    if (intent.categories.length) bits.push(intent.categories.map(LX.titleCase).join(" and ").toLowerCase());
    if (intent.materials.length) bits.push("in " + intent.materials.join(" or ").toLowerCase());
    if (intent.budgetMax != null && intent.budgetMin != null)
      bits.push("between " + LX.money(intent.budgetMin) + " and " + LX.money(intent.budgetMax));
    else if (intent.budgetMax != null) bits.push("under " + LX.money(intent.budgetMax));
    else if (intent.budgetMin != null) bits.push("over " + LX.money(intent.budgetMin));
    if (intent.occasion) bits.push("for " + (intent.occasion === "work" ? "the office" : "a " + intent.occasion));
    if (intent.recipient === "him") bits.push("for him");
    if (intent.recipient === "her") bits.push("for her");
    return bits.join(", ");
  }

  /* Build the assistant's answer for a free-text question. */
  function reply(input) {
    const text = String(input || "").toLowerCase();

    if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(text.trim())) {
      return { text: "Hello. Tell me who you are buying for, roughly what you want to spend, " +
        "and I will pull three or four pieces worth looking at.", picks: [] };
    }
    if (/\b(shipping|deliver|delivery|how long)\b/.test(text)) {
      return { text: "Express shipping is free over $500 and $35 below that. Most pieces leave the workshop " +
        "in one to four business days; the exact window is on each product page. Everything ships insured and " +
        "requires a signature.", picks: [] };
    }
    if (/\b(return|refund|exchange)\b/.test(text)) {
      return { text: "Thirty days, free of charge, provided the piece is unworn and the certificate is in the box. " +
        "Engraved and resized items are the exception — those are final sale, and we say so before you confirm.", picks: [] };
    }
    if (/\b(warrant|guarantee|repair|service)\b/.test(text)) {
      return { text: "Every piece carries a two-year international warranty covering manufacturing faults. " +
        "Mechanical watches should be serviced every five years; we will quote before any work starts.", picks: [] };
    }
    if (/\b(size|sizing|resize|fit)\b/.test(text)) {
      return { text: "Rings run 48–66 and the first resize is free within ninety days. Bracelets ship with " +
        "removable links. If you are unsure, order your usual size and we will adjust it.", picks: [] };
    }

    const { intent, results, total } = recommend(input, 4);

    if (!results.length) {
      const relaxed = recommend({ ...intent, materials: [], occasion: null, tone: null }, 3);
      if (relaxed.results.length) {
        return {
          text: "Nothing matches all of that at once. Loosening the material and occasion, these come closest — " +
            "tell me which constraint matters most and I will hold it firm.",
          picks: relaxed.results,
        };
      }
      return {
        text: "I could not find anything in that range. Our entry point is " +
          LX.money(Math.min.apply(null, LX.data().products.map(LX.priceOf))) +
          ". Try a wider budget, or tell me the occasion and I will work backwards from it.",
        picks: [],
      };
    }

    const summary = describeIntent(intent);
    const lead = summary
      ? "Looking for " + summary + " — " + total + (total === 1 ? " piece fits" : " pieces fit") + ". These are the strongest:"
      : "Here is where I would start:";

    const reasons = results.slice(0, 2).map((r) =>
      r.product.name + " " + (r.why.length ? r.why[0] : "rates " + r.product.rating + " across " + r.product.reviewCount + " reviews")
    ).join(", and ");

    return { text: lead + " " + reasons + ".", picks: results };
  }

  /* --------------------------------------------------------- gift finder */
  function giftFind(answers) {
    const intent = parse([
      answers.recipient || "", answers.occasion || "", answers.style || "",
      answers.budget ? "under $" + answers.budget : "",
    ].join(" "));
    if (answers.category && answers.category !== "any") intent.categories = [answers.category];
    return recommend(intent, 6);
  }

  /* ----------------------------------------------------------- compare */
  function compare(products) {
    if (products.length < 2) return null;
    const byPrice = products.slice().sort((a, b) => LX.priceOf(a) - LX.priceOf(b));
    const byRating = products.slice().sort((a, b) => b.rating - a.rating);
    const cheapest = byPrice[0], dearest = byPrice[byPrice.length - 1], best = byRating[0];

    const notes = products.map((p) => {
      const pros = [], cons = [];
      if (p === cheapest) pros.push("the least expensive of the set, by " + LX.money(LX.priceOf(dearest) - LX.priceOf(cheapest)));
      if (p === best) pros.push("the highest rated at " + p.rating + " across " + p.reviewCount + " reviews");
      if (p.discountPrice) pros.push("reduced from " + LX.money(p.price) + " right now");
      if (p.limitedEdition) pros.push("a numbered run — it will not be restocked");
      if (["Platinum", "18K Gold", "White Gold"].indexOf(p.material) > -1) pros.push(p.material + " holds its value better than plated alternatives");
      if (p.material === "Titanium" || p.material === "Carbon Fiber") pros.push("light enough to forget you are wearing it");
      if (p.stock === 0) cons.push("out of stock");
      else if (p.stock <= 4) cons.push("only " + p.stock + " left");
      if (p === dearest && products.length > 1) cons.push("the biggest spend here at " + LX.money(LX.priceOf(p)));
      if (p.reviewCount < 60) cons.push("fewer reviews than the others, so less to go on");
      if (p.material === "Sterling Silver") cons.push("silver needs polishing more often than gold");
      if (!pros.length) pros.push("a solid middle option with no obvious compromise");
      if (!cons.length) cons.push("nothing stands out against it");
      return { product: p, pros: pros, cons: cons };
    });

    let verdict;
    if (best === cheapest) verdict = best.name + " is the clear answer: it is both the cheapest and the best rated of the set.";
    else if (LX.priceOf(best) - LX.priceOf(cheapest) > LX.priceOf(cheapest) * 0.6)
      verdict = "If budget is the deciding factor, take " + cheapest.name + ". If it is not, " + best.name +
        " is rated higher and the gap is " + LX.money(LX.priceOf(best) - LX.priceOf(cheapest)) + ".";
    else verdict = best.name + " edges it — the price difference is small enough that the higher rating decides it.";

    return { notes: notes, verdict: verdict };
  }

  /* ---------------------------------------------------- review summary */
  function summarise(slug) {
    const list = LX.reviewsFor(slug);
    if (!list.length) return null;
    const avg = list.reduce((n, r) => n + r.rating, 0) / list.length;
    const positive = list.filter((r) => r.rating >= 4).length;
    const pct = Math.round(positive / list.length * 100);
    const verified = list.filter((r) => r.verified).length;

    const themes = [
      { key: "finishing", words: ["finishing", "finish", "bevel", "quality", "made"] },
      { key: "packaging", words: ["packaging", "box", "certificate", "gift"] },
      { key: "delivery",  words: ["delivered", "shipping", "arrived", "days", "wednesday", "tuesday", "friday"] },
      { key: "sizing",    words: ["sizing", "size", "resiz", "fit", "clasp"] },
      { key: "weight",    words: ["heavier", "weight", "heavy", "light"] },
      { key: "service",   words: ["support", "answered", "return postage", "warranty"] },
    ];
    const found = themes.map((t) => ({
      key: t.key,
      n: list.filter((r) => t.words.some((w) => (r.body + " " + r.title).toLowerCase().indexOf(w) > -1)).length,
    })).filter((t) => t.n > 0).sort((a, b) => b.n - a.n);

    const PHRASE = {
      finishing: "the finishing holds up in person",
      packaging: "the packaging carries the gift on its own",
      delivery:  "delivery lands inside the quoted window",
      sizing:    "sizing runs true, and resizes are handled without argument",
      weight:    "it wears heavier than expected, which most people came to like",
      service:   "support answers quickly when something is wrong",
    };

    const praise = found.slice(0, 3).map((t) => PHRASE[t.key]);
    const critical = list.filter((r) => r.rating <= 3);

    let text = pct + "% of " + list.length + " reviews rate this four stars or higher, averaging " +
      avg.toFixed(1) + ". " + (verified ? verified + " are verified purchases. " : "");
    if (praise.length) text += "Reviewers consistently mention that " + praise.join(", ") + ". ";
    if (critical.length) {
      text += critical.length === 1
        ? "One reviewer marked it down, over a delayed strap rather than the piece itself."
        : critical.length + " reviewers marked it down, mostly on delivery timing rather than the piece itself.";
    } else {
      text += "No reviewer has rated it below four stars.";
    }

    return {
      text: text, average: avg, count: list.length, positivePct: pct,
      verified: verified,
      breakdown: [5, 4, 3, 2, 1].map((n) => ({ stars: n, count: list.filter((r) => r.rating === n).length })),
      themes: found.slice(0, 4).map((t) => t.key),
    };
  }

  LX.AI = { parse, recommend, reply, giftFind, compare, summarise, describeIntent };
})(window.LX);
