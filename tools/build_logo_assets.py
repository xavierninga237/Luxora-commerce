"""Convert the supplied Luxora logo into a full set of production web assets."""
from PIL import Image
import numpy as np, os, json

SRC = "/mnt/user-data/uploads/logo__2_.png"
OUT = "/home/claude/luxora-commerce/assets/images/logos"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)

# Luminance -> alpha. The artwork is gold-on-black, so luminance is a clean matte.
lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]) / 255.0
alpha = np.clip((lum - 0.045) / (0.42 - 0.045), 0, 1)  # lift the gold, drop the black

# Unpremultiply so edges keep their gold colour instead of going muddy.
rgb = a.copy()
safe = np.maximum(alpha, 0.08)[..., None]
rgb = np.clip(rgb / safe, 0, 255)

rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
transparent = Image.fromarray(rgba, "RGBA")


def bbox_of(img, pad=14):
    arr = np.asarray(img)[..., 3]
    ys, xs = np.where(arr > 26)
    if len(ys) == 0:
        return None
    return (max(xs.min() - pad, 0), max(ys.min() - pad, 0),
            min(xs.max() + pad, img.width), min(ys.max() + pad, img.height))


def band(img, y0, y1):
    return img.crop((0, y0, img.width, y1))


def trim(img, pad=14):
    b = bbox_of(img, pad)
    return img.crop(b) if b else img


def save(img, name, size=None, bg=None):
    out = img
    if size:
        out = out.copy()
        out.thumbnail(size, Image.LANCZOS)
    if bg:
        canvas = Image.new("RGBA", out.size, bg)
        canvas.alpha_composite(out)
        out = canvas
    path = os.path.join(OUT, name)
    out.save(path)
    return path


H = im.height
# Locate the horizontal bands by looking at where ink appears per row.
ink = (np.asarray(transparent)[..., 3] > 40).sum(axis=1)
rows = np.where(ink > 3)[0]
gaps, prev = [], rows[0]
for r in rows[1:]:
    if r - prev > 18:
        gaps.append((prev, r))
    prev = r
print("row bands / gaps:", gaps)

mark_end = gaps[0][0] if gaps else int(H * 0.48)
mark = trim(band(transparent, 0, mark_end + 10), pad=10)
wordmark = trim(band(transparent, mark_end + 10, H), pad=16)
full = trim(transparent, pad=18)

save(full, "luxora-logo-full.png")
save(full, "luxora-logo-full@2x.png", (1600, 1600))
save(full, "luxora-logo-full.webp", (900, 900))
save(mark, "luxora-mark.png")
save(mark, "luxora-mark.webp", (512, 512))
save(wordmark, "luxora-wordmark.png")
save(wordmark, "luxora-wordmark.webp", (900, 900))

# Square, padded mark for favicons / app icons on the brand black.
def square_icon(size, pad_ratio=0.16, bg=(11, 11, 11, 255)):
    canvas = Image.new("RGBA", (size, size), bg)
    m = mark.copy()
    inner = int(size * (1 - pad_ratio * 2))
    m.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


for s in (16, 32, 48, 180, 192, 512):
    name = {180: "apple-touch-icon.png"}.get(s, f"favicon-{s}.png")
    if s in (192, 512):
        name = f"icon-{s}.png"
    square_icon(s).save(os.path.join(OUT, name))

square_icon(64).save(os.path.join(OUT, "favicon.ico"),
                     sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Transparent mark on transparent ground for the dark UI header
hdr = mark.copy(); hdr.thumbnail((240, 240), Image.LANCZOS)
hdr.save(os.path.join(OUT, "luxora-mark-240.png"))
wm = wordmark.copy(); wm.thumbnail((520, 520), Image.LANCZOS)
wm.save(os.path.join(OUT, "luxora-wordmark-520.png"))

# Open Graph / social card 1200x630
og = Image.new("RGBA", (1200, 630), (11, 11, 11, 255))
grad = np.zeros((630, 1200, 4), np.float32)
yy, xx = np.mgrid[0:630, 0:1200]
r = np.sqrt(((xx - 600) / 780.0) ** 2 + ((yy - 300) / 460.0) ** 2)
glow = np.clip(1 - r, 0, 1) ** 2.2 * 46
grad[..., 0] = 201; grad[..., 1] = 161; grad[..., 2] = 74; grad[..., 3] = glow
og.alpha_composite(Image.fromarray(grad.astype(np.uint8), "RGBA"))
lg = full.copy(); lg.thumbnail((700, 480), Image.LANCZOS)
og.alpha_composite(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2 - 8))
og.convert("RGB").save(os.path.join(OUT, "og-image.jpg"), quality=92)
og.save(os.path.join(OUT, "og-image.png"))

print(json.dumps(sorted(os.listdir(OUT)), indent=1))
