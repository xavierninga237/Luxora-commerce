"""Generate the AI feature pages, content pages, auth and account pages."""
import sys
sys.path.insert(0, "/home/claude/tools")
from build_pages_1 import storefront, write, head, FONTS, scripts

REL = "../"

# ------------------------------------------------------------ AI assistant
ASSISTANT = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Concierge</div>
  <h1>The Luxora Concierge</h1>
  <p class="lead">Describe who you are buying for, the occasion, and your budget. The concierge searches the whole catalogue and answers with pieces — and the reason behind each one.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="ai-shell">
    <aside>
      <div class="card">
        <h4 style="margin-bottom:1rem">Try asking</h4>
        <div class="stack">
          <button class="chip" data-prompt="I need a wedding gift under $4000" style="width:100%;justify-content:flex-start">A wedding gift under $4,000</button>
          <button class="chip" data-prompt="A luxury watch under $1000" style="width:100%;justify-content:flex-start">A luxury watch under $1,000</button>
          <button class="chip" data-prompt="Compare automatic watches" style="width:100%;justify-content:flex-start">Compare automatic watches</button>
          <button class="chip" data-prompt="Something in titanium for my husband" style="width:100%;justify-content:flex-start">Titanium, for my husband</button>
          <button class="chip" data-prompt="Rose gold earrings under $1500" style="width:100%;justify-content:flex-start">Rose gold earrings under $1,500</button>
          <button class="chip" data-prompt="What is your return policy?" style="width:100%;justify-content:flex-start">Your return policy?</button>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <h4 style="margin-bottom:.5rem">Also useful</h4>
        <p class="muted" style="font-size:var(--step--2);margin-bottom:1rem">Prefer a guided flow? The gift finder walks through it step by step.</p>
        <a class="btn btn--secondary btn--sm btn--block" href="RELpages/gift-finder.html">Open the gift finder</a>
      </div>
    </aside>
    <div class="chat">
      <div class="chat__head"><span class="chat__dot"></span><strong style="font-size:var(--step--1)">Luxora Concierge</strong>
        <span class="muted" style="font-size:var(--step--2);margin-left:auto">Runs on your device</span></div>
      <div class="chat__log" id="chat-log"></div>
      <div class="chat__foot">
        <form class="chat__form" id="chat-form">
          <input class="input" id="chat-input" placeholder="Describe what you are looking for…" autocomplete="off" aria-label="Message the concierge">
          <button class="btn btn--primary" type="submit" aria-label="Send">Send</button>
        </form>
      </div>
    </div>
  </div>
</div></section>
'''
write("pages/ai-assistant.html", storefront(
    "AI Concierge — Luxora Commerce", "Describe the occasion and the concierge finds the piece.",
    REL, ASSISTANT.replace("REL", REL), features=["features/ai-pages"]))

# ------------------------------------------------------------- gift finder
GIFT = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Gift Finder</div>
  <h1>Gift finder</h1>
  <p class="lead">Four questions. The right piece at the end.</p>
</div></section>
<section class="section"><div class="shell shell--tight" id="gift-finder">
  <div id="gift-quiz">
    <div style="height:3px;background:var(--surface-3);border-radius:3px;margin-bottom:3rem;overflow:hidden">
      <div id="gift-progress" style="height:100%;background:var(--metal);width:0;transition:width .4s var(--ease)"></div>
    </div>

    <div data-gift-step data-gift-key="recipient">
      <div class="center"><span class="eyebrow eyebrow--center">Question 1 of 4</span><h2>Who is it for?</h2></div>
      <div class="grid grid--2" style="margin-top:2rem">
        <button class="card card--hover center" data-gift-opt="him" style="cursor:pointer"><h3>For him</h3><p class="muted">Watches, signets, cufflink-adjacent pieces.</p></button>
        <button class="card card--hover center" data-gift-opt="her" style="cursor:pointer"><h3>For her</h3><p class="muted">Necklaces, earrings, rings and bracelets.</p></button>
        <button class="card card--hover center" data-gift-opt="self" style="cursor:pointer"><h3>For myself</h3><p class="muted">No judgement here.</p></button>
        <button class="card card--hover center" data-gift-opt="any" style="cursor:pointer"><h3>Not sure yet</h3><p class="muted">Show me a bit of everything.</p></button>
      </div>
    </div>

    <div data-gift-step data-gift-key="occasion" hidden>
      <div class="center"><span class="eyebrow eyebrow--center">Question 2 of 4</span><h2>What is the occasion?</h2></div>
      <div class="grid grid--3" style="margin-top:2rem">
        <button class="card card--hover center" data-gift-opt="wedding" style="cursor:pointer"><h3>Wedding</h3></button>
        <button class="card card--hover center" data-gift-opt="anniversary" style="cursor:pointer"><h3>Anniversary</h3></button>
        <button class="card card--hover center" data-gift-opt="birthday" style="cursor:pointer"><h3>Birthday</h3></button>
        <button class="card card--hover center" data-gift-opt="work" style="cursor:pointer"><h3>Work milestone</h3></button>
        <button class="card card--hover center" data-gift-opt="travel" style="cursor:pointer"><h3>Travel</h3></button>
        <button class="card card--hover center" data-gift-opt="everyday" style="cursor:pointer"><h3>Just because</h3></button>
      </div>
      <div class="center" style="margin-top:1.5rem"><button class="btn btn--ghost" data-gift-back>Back</button></div>
    </div>

    <div data-gift-step data-gift-key="budget" hidden>
      <div class="center"><span class="eyebrow eyebrow--center">Question 3 of 4</span><h2>What is your budget?</h2></div>
      <div class="grid grid--2" style="margin-top:2rem">
        <button class="card card--hover center" data-gift-opt="500" style="cursor:pointer"><h3>Under $500</h3></button>
        <button class="card card--hover center" data-gift-opt="1500" style="cursor:pointer"><h3>$500 – $1,500</h3></button>
        <button class="card card--hover center" data-gift-opt="4000" style="cursor:pointer"><h3>$1,500 – $4,000</h3></button>
        <button class="card card--hover center" data-gift-opt="12000" style="cursor:pointer"><h3>$4,000 and up</h3></button>
      </div>
      <div class="center" style="margin-top:1.5rem"><button class="btn btn--ghost" data-gift-back>Back</button></div>
    </div>

    <div data-gift-step data-gift-key="style" hidden>
      <div class="center"><span class="eyebrow eyebrow--center">Question 4 of 4</span><h2>What is their style?</h2></div>
      <div class="grid grid--2" style="margin-top:2rem">
        <button class="card card--hover center" data-gift-opt="minimal" style="cursor:pointer"><h3>Understated</h3><p class="muted">Quiet, clean, nothing shouting.</p></button>
        <button class="card card--hover center" data-gift-opt="bold" style="cursor:pointer"><h3>A statement</h3><p class="muted">Meant to be noticed.</p></button>
        <button class="card card--hover center" data-gift-opt="classic" style="cursor:pointer"><h3>Classic</h3><p class="muted">Timeless, traditional.</p></button>
        <button class="card card--hover center" data-gift-opt="modern" style="cursor:pointer"><h3>Modern</h3><p class="muted">Contemporary and technical.</p></button>
      </div>
      <div class="center" style="margin-top:1.5rem"><button class="btn btn--ghost" data-gift-back>Back</button></div>
    </div>
  </div>
  <div id="gift-results" hidden></div>
</div></section>
'''
write("pages/gift-finder.html", storefront(
    "Gift Finder — Luxora Commerce", "Answer four questions and find the perfect gift.",
    REL, GIFT.replace("REL", REL), features=["features/ai-pages"]))

# --------------------------------------------------------------- about
ABOUT = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>About</div>
  <h1>The house of Luxora</h1>
</div></section>
<section class="section"><div class="shell shell--tight">
  <p class="lead">Luxora Commerce is a demonstration of what a modern luxury brand can be online: the finish of a Fifth Avenue window, the speed of a checkout that respects your time, and a concierge that actually knows the catalogue.</p>
  <div class="rule rule--left"><i></i></div>
  <div class="editorial" style="margin-top:2rem">
    <img src="RELassets/images/collections/heritage.svg" alt="" loading="lazy">
    <div>
      <h2>Small runs, by hand</h2>
      <p>Every piece begins as a drawing and passes through the same pair of eyes twice before it ships. We keep production deliberately small — it is the only way to inspect every clasp and setting properly.</p>
      <p>The eight houses under the Luxora name each hold a different discipline: Aurelius for goldsmithing, Velmont for diamonds, Kronique for complications, Ardent for leather. Together they cover the full catalogue you see here.</p>
    </div>
  </div>
</div></section>
<section class="section section--deep"><div class="shell">
  <div class="grid grid--3">
    <div class="card card--flat"><div class="metrics__value mono">2014</div><p class="muted">Founded, as a single-bench watch workshop.</p></div>
    <div class="card card--flat"><div class="metrics__value mono">60+</div><p class="muted">Countries we ship to, insured and signed for.</p></div>
    <div class="card card--flat"><div class="metrics__value mono">98%</div><p class="muted">Of clients say they would buy from us again.</p></div>
  </div>
</div></section>
'''
write("pages/about.html", storefront("About — Luxora Commerce", "The story behind Luxora Commerce.",
    REL, ABOUT.replace("REL", REL)))

# ----------------------------------------------------------------- journal
JOURNAL = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Journal</div>
  <h1>The Journal</h1>
  <p class="lead">Notes on craft, materials and how to buy well.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="grid grid--3" id="journal-grid"></div>
</div></section>
<script>
document.addEventListener("DOMContentLoaded",function(){
  var host=document.getElementById("journal-grid");
  host.innerHTML=window.LUXORA.journal.map(function(j){
    return '<a class="tile reveal" href="RELpages/journal.html" style="aspect-ratio:auto">'+
      '<img src="REL'+j.image+'" alt="" loading="lazy" style="aspect-ratio:16/10">'+
      '<div class="tile__body"><div class="tile__meta">'+window.LX.dateShort(j.date)+' · '+j.read+'</div>'+
      '<h3 class="tile__title" style="font-size:1.3rem">'+j.title+'</h3>'+
      '<p class="muted" style="font-size:var(--step--2);margin:.4rem 0 0">'+j.excerpt+'</p></div></a>';
  }).join("");
  window.LX.revealScan(host);
});
</script>
'''
write("pages/journal.html", storefront("Journal — Luxora Commerce", "Notes on craft and materials.",
    REL, JOURNAL.replace("REL", REL)))

# -------------------------------------------------------------------- FAQ
FAQ = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Support</div>
  <h1>Support</h1>
  <p class="lead">Shipping, returns, warranty and sizing — answered.</p>
</div></section>
<section class="section section--tight"><div class="shell shell--tight">
  <div class="accordion">
    <div class="accordion__item"><button class="accordion__btn">How long does shipping take?<i>+</i></button><div class="accordion__panel"><div>Express shipping is free over $500 and $35 below that. Most pieces leave the workshop in one to four business days; the exact window is on each product page. Everything ships insured and requires a signature.</div></div></div>
    <div class="accordion__item"><button class="accordion__btn">What is your return policy?<i>+</i></button><div class="accordion__panel"><div>Thirty days, free of charge, provided the piece is unworn with its certificate in the box. Engraved and resized items are final sale, and we tell you before you confirm.</div></div></div>
    <div class="accordion__item"><button class="accordion__btn">Is my purchase under warranty?<i>+</i></button><div class="accordion__panel"><div>Every piece carries a two-year international warranty against manufacturing faults. Register it in your account to activate cover from the delivery date.</div></div></div>
    <div class="accordion__item"><button class="accordion__btn">Can rings be resized?<i>+</i></button><div class="accordion__panel"><div>Rings run 48–66 and the first resize is free within ninety days. Bracelets ship with removable links.</div></div></div>
    <div class="accordion__item"><button class="accordion__btn">How do I care for my piece?<i>+</i></button><div class="accordion__panel"><div>Care notes are on every product page. As a rule: keep gold and silver away from perfume and chlorine, and have mechanical watches serviced every five years.</div></div></div>
    <div class="accordion__item"><button class="accordion__btn">Which payment methods do you accept?<i>+</i></button><div class="accordion__panel"><div>Card via Stripe, plus PayPal, Apple Pay and Google Pay. Your card details never touch our servers.</div></div></div>
  </div>
  <div class="newsletter" style="margin-top:3rem">
    <h2>Still have a question?</h2>
    <p class="lead" style="margin-inline:auto">Ask the concierge — it answers shipping, sizing and returns instantly.</p>
    <a class="btn btn--primary" href="RELpages/ai-assistant.html" style="margin-top:1rem">Open the concierge</a>
  </div>
</div></section>
'''
write("pages/faq.html", storefront("Support — Luxora Commerce", "Shipping, returns, warranty and sizing.",
    REL, FAQ.replace("REL", REL)))

# ---------------------------------------------------------------- contact
CONTACT = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Contact</div>
  <h1>Contact</h1>
  <p class="lead">A private client team, not a queue.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="editorial">
    <div>
      <form onsubmit="event.preventDefault();window.LX.toast('Message sent','Our client team will reply within one business day.');this.reset();">
        <div class="grid-2">
          <label class="field"><span class="field__label">Name</span><input class="input" required></label>
          <label class="field"><span class="field__label">Email</span><input class="input" type="email" required></label>
        </div>
        <label class="field"><span class="field__label">Subject</span><input class="input"></label>
        <label class="field"><span class="field__label">Message</span><textarea class="textarea" required></textarea></label>
        <button class="btn btn--primary btn--lg" type="submit">Send message</button>
      </form>
    </div>
    <div class="card">
      <h3>Client care</h3>
      <p class="muted">Monday to Saturday, 9am–7pm CET.</p>
      <div class="rule rule--left rule--tight"><i></i></div>
      <p><strong>Email</strong><br>care@luxora.example</p>
      <p><strong>Phone</strong><br>+41 22 000 0000</p>
      <p><strong>Atelier</strong><br>Rue du Rhône 00<br>1204 Geneva, Switzerland</p>
    </div>
  </div>
</div></section>
'''
write("pages/contact.html", storefront("Contact — Luxora Commerce", "Reach the Luxora client team.",
    REL, CONTACT.replace("REL", REL)))

print("AI + content pages written")
