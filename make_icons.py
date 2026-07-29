# Generates app-icon PNGs from the Tour Against Cancer logo (supersampled for crisp edges).
from PIL import Image, ImageDraw, ImageFont

S = 4  # supersample factor
BASE = 512 * S
FONT = "C:/Windows/Fonts/arialbd.ttf"

def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

def gradient(size):
    left, right = (0x2b, 0x16, 0xd6), (0xe5, 0x09, 0x14)
    img = Image.new("RGB", (size, size))
    px = img.load()
    for x in range(size):
        c = lerp(left, right, x / (size - 1))
        for y in range(size):
            px[x, y] = c
    return img

def draw_content(size):
    """Flower + bike + text + ribbon on a transparent layer (512-space coords * S)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    yellow = (0xf7, 0xd7, 0x74, 255)
    dark = (0x1a, 0x1a, 0x1a, 255)

    def circle(cx, cy, r, fill=None, outline=None, width=0):
        d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
                  fill=fill, outline=outline, width=width * S)

    # flower
    for (cx, cy, r) in [(256,150,70),(362,200,70),(380,300,70),(320,380,70),
                        (256,410,70),(192,380,70),(132,300,70),(150,200,70),(256,280,120)]:
        circle(cx, cy, r, fill=yellow)

    # bike
    lw = 6 * S
    circle(315, 205, 26, outline=dark, width=6)
    circle(380, 205, 26, outline=dark, width=6)
    def line(pts):
        d.line([(x * S, y * S) for (x, y) in pts], fill=dark, width=lw, joint="curve")
    line([(315,205),(345,168),(372,205)])
    line([(345,168),(360,168)])
    line([(330,188),(360,188),(347,205)])

    # text
    font = ImageFont.truetype(FONT, 46 * S)
    for txt, by in [("Tour", 290), ("Against", 336), ("Cancer", 382)]:
        d.text((256 * S, by * S), txt, font=font, fill=dark, anchor="ms")

    # ribbon (awareness ribbon: two strands looping at top, tails splaying below)
    gold = (0xf5, 0xc5, 0x18, 255)
    rw = 8 * S
    d.line([(x * S, y * S) for (x, y) in [(446,108),(436,134),(453,162)]], fill=gold, width=rw, joint="curve")
    d.line([(x * S, y * S) for (x, y) in [(446,108),(456,134),(439,162)]], fill=gold, width=rw, joint="curve")
    return img

def build(scale):
    bg = gradient(BASE).convert("RGBA")
    content = draw_content(BASE)
    if scale < 1.0:
        s = int(BASE * scale)
        content_s = content.resize((s, s), Image.LANCZOS)
        layer = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
        off = (BASE - s) // 2
        layer.paste(content_s, (off, off), content_s)
        content = layer
    bg.alpha_composite(content)
    return bg

def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).convert("RGB").save("icons/" + name, "PNG")

full = build(1.0)
mask = build(0.80)  # maskable: content inside the safe zone
save(full, "icon-512.png", 512)
save(full, "icon-192.png", 192)
save(full, "apple-touch-icon.png", 180)
save(mask, "icon-maskable-512.png", 512)
print("icons written")
