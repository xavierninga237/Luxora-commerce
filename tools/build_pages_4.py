"""Generate the authentication pages and the customer account portal."""
import sys
sys.path.insert(0, "/home/claude/tools")
from build_pages_1 import storefront, write, head, FONTS, scripts

REL = "../"


def auth_page(title, desc, inner, name_field=False):
    body = '''
<div class="auth">
  <div class="auth__aside">
    <img class="bgart" src="RELassets/images/collections/diamond.svg" alt="">
    <div class="auth__aside-inner">
      <img src="RELassets/images/logos/luxora-mark.png" alt="Luxora">
      <h2 class="display" style="font-size:2.2rem">Timeless Luxury.<br>Delivered Worldwide.</h2>
      <p class="muted">Members of the Luxora Circle receive early access to limited editions and private previews.</p>
    </div>
  </div>
  <div class="auth__form"><div class="auth__form-inner">INNER</div></div>
</div>
'''.replace("REL", REL).replace("INNER", inner.replace("REL", REL))
    html = head(title, desc, REL) + '''
<body>
<a class="skip-link" href="#main">Skip to content</a>
<main id="main">''' + body + '''</main>
''' + scripts(REL, ["features/pages"]) + '''
</body></html>'''
    return html


LOGIN = '''
<a class="link-line" href="RELindex.html" style="margin-bottom:2rem">&larr; <span>Back to store</span></a>
<h1 style="font-size:2.2rem">Welcome back</h1>
<p class="muted" style="margin-bottom:2rem">Sign in to your Luxora account.</p>
<form id="auth-form">
  <label class="field"><span class="field__label">Email</span><input class="input" id="auth-email" type="email" placeholder="you@example.com" required></label>
  <label class="field"><span class="field__label">Password</span><input class="input" type="password" placeholder="••••••••" required></label>
  <div class="spread" style="margin-bottom:1.5rem">
    <label class="check"><input type="checkbox"><span>Remember me</span></label>
    <a class="link-line" href="RELauth/forgot-password.html" style="font-size:var(--step--2)">Forgot password?</a>
  </div>
  <button class="btn btn--primary btn--lg btn--block" type="submit">Sign in</button>
</form>
<div class="auth__divider">or</div>
<button class="btn btn--secondary btn--block" onclick="window.LX.Session.signIn('guest@luxora.com','Guest');window.location.href='RELaccount/dashboard.html'">Continue as guest</button>
<p class="center muted" style="margin-top:2rem;font-size:var(--step--1)">New here? <a class="link-line" href="RELauth/register.html" style="display:inline-flex">Create an account</a></p>
'''
write("auth/login.html", auth_page("Sign in — Luxora Commerce", "Sign in to your account.", LOGIN))

REGISTER = '''
<a class="link-line" href="RELindex.html" style="margin-bottom:2rem">&larr; <span>Back to store</span></a>
<h1 style="font-size:2.2rem">Create your account</h1>
<p class="muted" style="margin-bottom:2rem">Join the Luxora Circle.</p>
<form id="auth-form">
  <label class="field"><span class="field__label">Full name</span><input class="input" id="auth-name" placeholder="Your name" required></label>
  <label class="field"><span class="field__label">Email</span><input class="input" id="auth-email" type="email" placeholder="you@example.com" required></label>
  <label class="field"><span class="field__label">Password</span><input class="input" type="password" placeholder="At least 8 characters" required></label>
  <label class="check" style="margin-bottom:1.5rem"><input type="checkbox" required><span>I agree to the terms and privacy policy.</span></label>
  <button class="btn btn--primary btn--lg btn--block" type="submit">Create account</button>
</form>
<p class="center muted" style="margin-top:2rem;font-size:var(--step--1)">Already have an account? <a class="link-line" href="RELauth/login.html" style="display:inline-flex">Sign in</a></p>
'''
write("auth/register.html", auth_page("Create account — Luxora Commerce", "Create your Luxora account.", REGISTER))

FORGOT = '''
<a class="link-line" href="RELauth/login.html" style="margin-bottom:2rem">&larr; <span>Back to sign in</span></a>
<h1 style="font-size:2.2rem">Reset your password</h1>
<p class="muted" style="margin-bottom:2rem">Enter your email and we will send a reset link.</p>
<form onsubmit="event.preventDefault();window.LX.toast('Check your inbox','If that email is registered, a reset link is on its way.');">
  <label class="field"><span class="field__label">Email</span><input class="input" type="email" placeholder="you@example.com" required></label>
  <button class="btn btn--primary btn--lg btn--block" type="submit">Send reset link</button>
</form>
'''
write("auth/forgot-password.html", auth_page("Reset password — Luxora Commerce", "Reset your password.", FORGOT))

RESET = '''
<a class="link-line" href="RELauth/login.html" style="margin-bottom:2rem">&larr; <span>Back to sign in</span></a>
<h1 style="font-size:2.2rem">Choose a new password</h1>
<p class="muted" style="margin-bottom:2rem">Make it at least eight characters.</p>
<form onsubmit="event.preventDefault();window.LX.toast('Password updated','You can now sign in.');setTimeout(function(){location.href='RELauth/login.html'},800);">
  <label class="field"><span class="field__label">New password</span><input class="input" type="password" required></label>
  <label class="field"><span class="field__label">Confirm password</span><input class="input" type="password" required></label>
  <button class="btn btn--primary btn--lg btn--block" type="submit">Update password</button>
</form>
'''
write("auth/reset-password.html", auth_page("Set new password — Luxora Commerce", "Set a new password.", RESET))

# =================================================================== account
ACCOUNT_NAV = [
    ("dashboard", "Dashboard", "grid"),
    ("orders", "Orders", "box"),
    ("wishlist", "Wishlist", "heart"),
    ("addresses", "Addresses", "pin"),
    ("settings", "Settings", "gear"),
]


def account_side(active):
    from build_pages_1 import ROOT  # noqa
    items = ""
    for slug, label, ic in ACCOUNT_NAV:
        href = REL + ("pages/wishlist.html" if slug == "wishlist" else "account/%s.html" % slug)
        cls = " class='is-on'" if slug == active else ""
        items += '<li><a href="%s"%s data-ic="%s">%s</a></li>' % (href, cls, ic, label)
    return '<ul class="side-nav" id="account-side">' + items + \
        '<li><a href="#" data-action="sign-out">Sign out</a></li></ul>'


def account_page(title, active, inner):
    body = '''
<section class="page-head"><div class="shell">
  <div class="breadcrumb"><a href="RELindex.html">Home</a><span>/</span>Account</div>
  <h1>Hello, <span data-user-name>Guest</span></h1>
  <p class="lead">Manage your orders, saved pieces and details.</p>
</div></section>
<section class="section section--tight"><div class="shell">
  <div class="account">
    SIDE
    <div id="account-panels">INNER</div>
  </div>
</div></section>
'''.replace("REL", REL).replace("SIDE", account_side(active)).replace("INNER", inner.replace("REL", REL))
    return storefront(title, "Your Luxora account.", REL, body, features=["features/pages"])


write("account/dashboard.html", account_page("Account — Luxora Commerce", "dashboard", '''
<div id="account-dashboard"></div>
<div class="section-head section-head--split" style="margin-top:2rem"><div><h2 style="font-size:1.6rem">Recent orders</h2></div>
  <a class="link-line" href="RELaccount/orders.html">All orders <span>&rarr;</span></a></div>
<div id="account-orders"></div>
'''))

write("account/orders.html", account_page("Orders — Luxora Commerce", "orders", '''
<div class="section-head"><h2 style="font-size:1.6rem">Your orders</h2></div>
<div id="account-orders"></div>
'''))

write("account/addresses.html", account_page("Addresses — Luxora Commerce", "addresses", '''
<div class="section-head"><h2 style="font-size:1.6rem">Saved addresses</h2></div>
<div class="grid grid--2">
  <div class="card"><span class="badge">Default</span><h3 style="font-size:1.3rem;margin-top:1rem">Home</h3>
    <p class="muted">Marcus Reyes<br>128 Park Avenue<br>New York, NY 10016<br>United States</p>
    <div class="cluster"><button class="btn btn--ghost btn--sm">Edit</button><button class="btn btn--ghost btn--sm">Remove</button></div></div>
  <div class="card"><h3 style="font-size:1.3rem;margin-top:2rem">Office</h3>
    <p class="muted">Marcus Reyes<br>500 Madison Avenue, 14th Floor<br>New York, NY 10022<br>United States</p>
    <div class="cluster"><button class="btn btn--ghost btn--sm">Edit</button><button class="btn btn--ghost btn--sm">Remove</button></div></div>
</div>
<button class="btn btn--secondary" style="margin-top:1.5rem" onclick="window.LX.toast('Address form','This would open the address editor.')">Add a new address</button>
'''))

write("account/settings.html", account_page("Settings — Luxora Commerce", "settings", '''
<div class="section-head"><h2 style="font-size:1.6rem">Settings</h2></div>
<form id="account-profile-form" style="max-width:520px">
  <div class="grid-2">
    <label class="field"><span class="field__label">First name</span><input class="input" value="Marcus"></label>
    <label class="field"><span class="field__label">Last name</span><input class="input" value="Reyes"></label>
  </div>
  <label class="field"><span class="field__label">Email</span><input class="input" type="email" value="marcus.reyes@example.com"></label>
  <label class="field"><span class="field__label">Phone</span><input class="input" type="tel" value="+1 212 000 0000"></label>
  <h3 style="font-size:1.2rem;margin:2rem 0 1rem">Preferences</h3>
  <label class="check" style="margin-bottom:.75rem"><input type="checkbox" checked><span>Email me about new arrivals and limited editions</span></label>
  <label class="check" style="margin-bottom:1.5rem"><input type="checkbox" checked><span>Send order and shipping updates</span></label>
  <button class="btn btn--primary btn--lg" type="submit">Save changes</button>
</form>
'''))

print("auth + account pages written")
