"""
Asset pipeline for vantis-build.

Run once from the repo root:  python scripts/build_assets.py

Reads nothing at runtime and writes only into public/. Source photographs are
COPIED from the read-only vantis/ repo — that path is used only by this script,
never by application code. If vantis/ is absent the photo step is skipped and
grey placeholders are written instead, so the app still builds.
"""
import os
import shutil
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VANTIS = r"C:\vantis"

PHOTO_SRC = os.path.join(VANTIS, "public", "documents", "divya-villas")
PHOTO_OUT = os.path.join(ROOT, "public", "photos", "divya-villas")
FRAME_OUT = os.path.join(ROOT, "public", "frames")
BRAND_OUT = os.path.join(ROOT, "public", "brand")

MAX_BYTES = 170 * 1024
MAX_EDGE = 1200

BG = (10, 10, 15)
GOLD = (201, 168, 76)
INK = (240, 238, 232)
GRID = (26, 24, 18)

# vantis filename -> manifest filename
PHOTO_MAP = [
    ("1 Road.jpeg", "01_road.jpeg"),
    ("2 Road.jpeg", "02_road.jpeg"),
    ("3 Road.jpeg", "03_road.jpeg"),
    ("4 Site.jpeg", "04_site.jpeg"),
    ("5 Site.jpeg", "05_site.jpeg"),
    ("6 Road.jpeg", "06_road.jpeg"),
    ("7 Site.jpeg", "07_site.jpeg"),
    ("8 Udrain.jpeg", "08_underground_drainage.jpeg"),
    ("9 Layout.jpeg", "09_layout.jpeg"),
    ("10 Park.jpeg", "10_park.jpeg"),
    ("11 Layout.jpeg", "11_layout.jpeg"),
    ("12 Borewell.jpeg", "12_borewell.jpeg"),
    ("13 Street light.jpeg", "13_streetlight.jpeg"),
]

BRAND = [
    "vantislockup.png",
    "vantislockuponnight.png",
    "vantismarkonnight.png",
    "vantismarkink.png",
    "orianodelogo.png",
]

DIVYA_FRAMES = [
    ("frame-2024-01.jpg", "15 JAN 2024"),
    ("frame-2024-06.jpg", "15 JUN 2024"),
    ("frame-2024-11.jpg", "15 NOV 2024"),
    ("frame-2025-04.jpg", "15 APR 2025"),
    ("frame-2025-08.jpg", "15 AUG 2025"),
    ("frame-2025-12.jpg", "06 DEC 2025"),
]

MERIDIAN_FRAMES = [
    ("frame-2023-06.jpg", "30 JUN 2023"),
    ("frame-2023-12.jpg", "31 DEC 2023"),
    ("frame-2024-06.jpg", "30 JUN 2024"),
    ("frame-2024-12.jpg", "31 DEC 2024"),
    ("frame-2025-03.jpg", "31 MAR 2025"),
    ("frame-2025-09.jpg", "30 SEP 2025"),
]


def font(size, bold=False):
    for name in (
        ("seguisb.ttf", "segoeui.ttf") if bold else ("segoeui.ttf",)
    ) + ("arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def centre(draw, cx, y, text, f, fill):
    l, t, r, b = draw.textbbox((0, 0), text, font=f)
    draw.text((cx - (r - l) / 2, y), text, font=f, fill=fill)
    return b - t


def make_frame(path, date_label, synthetic=False):
    """1200x800 dark placeholder with a faint gold grid and the frame date."""
    w, h = 1200, 800
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)

    for x in range(0, w, 40):
        d.line([(x, 0), (x, h)], fill=GRID, width=1)
    for y in range(0, h, 40):
        d.line([(0, y), (w, y)], fill=GRID, width=1)

    d.rectangle([40, 40, w - 40, h - 40], outline=(58, 48, 32), width=1)

    # Corner registration ticks — sells "same centre, same zoom, same frame"
    for cx, cy in ((40, 40), (w - 40, 40), (40, h - 40), (w - 40, h - 40)):
        d.line([(cx - 12, cy), (cx + 12, cy)], fill=(90, 76, 46), width=1)
        d.line([(cx, cy - 12), (cx, cy + 12)], fill=(90, 76, 46), width=1)

    y = 300
    y += centre(d, w / 2, y, date_label, font(58, bold=True), GOLD) + 30
    y += centre(d, w / 2, y, "PLACEHOLDER — awaiting export", font(26), (144, 144, 170)) + 18
    centre(
        d, w / 2, y,
        "Founder exports this frame from Google Earth Pro historical imagery",
        font(17), (107, 107, 136),
    )

    if synthetic:
        d.rectangle([40, h - 92, 470, h - 48], fill=(60, 40, 6), outline=(245, 158, 11), width=2)
        d.text((60, h - 82), "SYNTHETIC — ILLUSTRATIVE", font=font(22, bold=True), fill=(245, 158, 11))
        big = font(120, bold=True)
        l, t, r, b = d.textbbox((0, 0), "SYNTHETIC", font=big)
        wm = Image.new("RGBA", (r - l + 20, b - t + 20), (0, 0, 0, 0))
        ImageDraw.Draw(wm).text((10 - l, 10 - t), "SYNTHETIC", font=big, fill=(245, 158, 11, 34))
        wm = wm.rotate(28, expand=True, resample=Image.BICUBIC)
        img.paste(wm, ((w - wm.width) // 2, (h - wm.height) // 2), wm)
    else:
        d.text((48, h - 74), "SATELLITE ARCHIVE · PLACEHOLDER", font=font(18), fill=(84, 84, 107))

    img.save(path, "JPEG", quality=82, optimize=True)
    return os.path.getsize(path)


def grey_placeholder(path, label):
    img = Image.new("RGB", (1200, 900), (22, 22, 34))
    d = ImageDraw.Draw(img)
    d.rectangle([20, 20, 1180, 880], outline=(42, 42, 62), width=2)
    centre(d, 600, 400, "GROUND RECORD", font(34, bold=True), (107, 107, 136))
    centre(d, 600, 450, label, font(24), (84, 84, 107))
    centre(d, 600, 500, "photograph pending", font(20), (84, 84, 107))
    img.save(path, "JPEG", quality=80, optimize=True)
    return os.path.getsize(path)


def compress(src, dst):
    """
    Downscale to MAX_EDGE and step quality down until under MAX_BYTES.
    Never emit a file larger than the source — a few of these are already
    well compressed and re-encoding them at high quality inflates them.
    """
    src_size = os.path.getsize(src)
    img = Image.open(src).convert("RGB")
    img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    for q in (84, 78, 72, 66, 60, 54, 48, 42):
        img.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
        size = os.path.getsize(dst)
        if size <= MAX_BYTES:
            if size > src_size:
                shutil.copy2(src, dst)
                return src_size, 0
            return size, q
    size = os.path.getsize(dst)
    if size > src_size:
        shutil.copy2(src, dst)
        return src_size, 0
    return size, 42


def main():
    for p in (PHOTO_OUT, BRAND_OUT,
              os.path.join(FRAME_OUT, "divya-villas"),
              os.path.join(FRAME_OUT, "project-meridian")):
        os.makedirs(p, exist_ok=True)

    print("== ground photographs -> public/photos/divya-villas")
    have_src = os.path.isdir(PHOTO_SRC)
    if not have_src:
        print(f"   !! source not found: {PHOTO_SRC}")
        print("      writing grey placeholders instead; app still builds")
    for src_name, out_name in PHOTO_MAP:
        dst = os.path.join(PHOTO_OUT, out_name)
        src = os.path.join(PHOTO_SRC, src_name)
        if have_src and os.path.isfile(src):
            before = os.path.getsize(src)
            size, q = compress(src, dst)
            print(f"   {out_name:<34} {before//1024:>4} KB -> {size//1024:>3} KB  q{q}")
        else:
            size = grey_placeholder(dst, out_name)
            print(f"   {out_name:<34} PLACEHOLDER {size//1024:>3} KB")

    print("== brand marks -> public/brand")
    for b in BRAND:
        src = os.path.join(VANTIS, "public", b)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(BRAND_OUT, b))
            print(f"   {b:<28} {os.path.getsize(src)//1024:>4} KB")
        else:
            print(f"   {b:<28} MISSING — skipped")

    print("== placeholder frames -> public/frames")
    for name, label in DIVYA_FRAMES:
        s = make_frame(os.path.join(FRAME_OUT, "divya-villas", name), label, synthetic=False)
        print(f"   divya-villas/{name:<22} {s//1024:>3} KB")
    for name, label in MERIDIAN_FRAMES:
        s = make_frame(os.path.join(FRAME_OUT, "project-meridian", name), label, synthetic=True)
        print(f"   project-meridian/{name:<18} {s//1024:>3} KB")

    print("== budget check (300 KB ceiling)")
    over = []
    for base, _, files in os.walk(os.path.join(ROOT, "public")):
        for fn in files:
            fp = os.path.join(base, fn)
            sz = os.path.getsize(fp)
            if sz > 300 * 1024:
                over.append((os.path.relpath(fp, ROOT), sz))
    if over:
        for rel, sz in over:
            print(f"   OVER: {rel} {sz//1024} KB")
        sys.exit(1)
    print("   all assets within budget")


if __name__ == "__main__":
    main()
