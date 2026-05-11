#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / ".codex-python-deps"))

from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT.parent / "card-learn"
QUIZ_INDEX = ROOT / "assets/season-1/quizzes/index.json"
CARD_ROOT = ROOT / "assets/season-1/cards-poalim"
PACK_ROOT = ROOT / "assets/season-1/packs-poalim"
SOURCE_CARD_DIR = SOURCE_ROOT / "assets/season-1/cards-wave2-he/bank-hapoalim"
SOURCE_PACK = SOURCE_ROOT / "assets/season-1/packs-wave2-he/pack-bank-hapoalim.webp"
MANIFEST_PATH = ROOT / "assets/season-1/poalim-rendered-assets-manifest.json"

FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
W, H = 1024, 1432

PACK_THEMES = {
    "poalim-bank-basics": {"rail": (206, 18, 28), "glow": (255, 214, 74), "badge": (21, 135, 142)},
    "poalim-saving-choices": {"rail": (206, 18, 28), "glow": (68, 180, 106), "badge": (40, 150, 104)},
    "poalim-payments-cards": {"rail": (206, 18, 28), "glow": (74, 133, 218), "badge": (57, 105, 184)},
    "poalim-loans-mortgage": {"rail": (206, 18, 28), "glow": (156, 96, 218), "badge": (126, 82, 178)},
    "poalim-digital-safety": {"rail": (206, 18, 28), "glow": (84, 97, 112), "badge": (42, 50, 62)},
}

SOURCE_CARDS = [
    "01-daily-deposit.webp",
    "02-mortgage.webp",
    "03-pre-approval.webp",
    "04-mortgage-mix.webp",
    "05-prime-track.webp",
    "06-fixed-rate.webp",
    "07-variable-rate.webp",
    "08-index-linked.webp",
    "09-refinance.webp",
    "10-collateral-appraisal.webp",
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size=size)


def rtl(text: str) -> str:
    return get_display(str(text).replace("'", "׳"))


def text_bbox(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, stroke: int = 0) -> tuple[int, int, int, int]:
    return draw.textbbox((0, 0), rtl(text), font=fnt, stroke_width=stroke)


def fit_font(draw: ImageDraw.ImageDraw, text: str, width: int, start: int, bold: bool = True, minimum: int = 20) -> ImageFont.FreeTypeFont:
    size = start
    while size >= minimum:
        fnt = font(size, bold)
        box = text_bbox(draw, text, fnt)
        if box[2] - box[0] <= width:
            return fnt
        size -= 2
    return font(minimum, bold)


def draw_center(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int] | tuple[int, int, int],
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int, int] | tuple[int, int, int] = (0, 0, 0, 255),
) -> None:
    visual = rtl(text)
    bbox = draw.textbbox((0, 0), visual, font=fnt, stroke_width=stroke_width)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = box[0] + (box[2] - box[0] - tw) / 2
    y = box[1] + (box[3] - box[1] - th) / 2 - bbox[1] / 2
    draw.text((x, y), visual, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, width: int, max_lines: int = 2) -> list[str]:
    words = str(text).split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        box = text_bbox(draw, candidate, fnt)
        if box[2] - box[0] <= width or not current:
            current = candidate
            continue
        lines.append(current)
        current = word
        if len(lines) >= max_lines - 1:
            break
    if current and len(lines) < max_lines:
        lines.append(current)
    return lines[:max_lines]


def gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", size)
    pix = img.load()
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        for x in range(size[0]):
            pix[x, y] = color
    return img


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_rounded(base: Image.Image, src: Image.Image, box: tuple[int, int, int, int], radius: int) -> None:
    resized = src.resize((box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS)
    mask = rounded_mask(resized.size, radius)
    base.paste(resized, (box[0], box[1]), mask)


def add_card_shadow(img: Image.Image) -> None:
    shadow = Image.new("RGBA", (900, 1300), (0, 0, 0, 95))
    shadow.putalpha(rounded_mask(shadow.size, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    img.alpha_composite(shadow, (70, 78))


def draw_sparkle(draw: ImageDraw.ImageDraw, cx: int, cy: int, color=(224, 160, 38, 255)) -> None:
    draw.polygon(
        [(cx, cy - 22), (cx + 8, cy - 7), (cx + 22, cy), (cx + 8, cy + 7), (cx, cy + 22), (cx - 8, cy + 7), (cx - 22, cy), (cx - 8, cy - 7)],
        fill=color,
    )
    draw.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=(255, 247, 190, 255))


def draw_poalim_mark(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, fill=(206, 18, 28, 255)) -> None:
    half = size // 2
    draw.rounded_rectangle((cx - half, cy - half, cx + half, cy + half), radius=size // 5, fill=fill)
    pts = [(cx, cy - half), (cx + half, cy), (cx, cy + half), (cx - half, cy)]
    draw.polygon(pts, fill=fill)
    draw.line((cx - size // 4, cy, cx + size // 4, cy), fill=(255, 255, 255, 255), width=max(6, size // 9))
    draw.line((cx, cy - size // 4, cx, cy + size // 4), fill=(255, 255, 255, 255), width=max(6, size // 9))


def source_art(index: int) -> Image.Image:
    src_path = SOURCE_CARD_DIR / SOURCE_CARDS[(index - 1) % len(SOURCE_CARDS)]
    if not src_path.exists():
        return gradient((720, 470), (234, 238, 244), (207, 18, 28))
    src = Image.open(src_path).convert("RGBA")
    w, h = src.size
    crop = src.crop((int(w * 0.12), int(h * 0.285), int(w * 0.88), int(h * 0.635)))
    crop = crop.resize((720, 470), Image.Resampling.LANCZOS)
    return crop


def draw_game_art(base: Image.Image, draw: ImageDraw.ImageDraw, pack_id: str, index: int, box: tuple[int, int, int, int]) -> None:
    theme = PACK_THEMES[pack_id]
    x1, y1, x2, y2 = box
    bg = gradient((x2 - x1, y2 - y1), (255, 245, 223), theme["glow"])
    base.alpha_composite(bg, (x1, y1))
    art = source_art(index)
    art = art.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))
    paste_rounded(base, art, (x1 + 16, y1 + 16, x2 - 16, y2 - 16), 38)
    overlay = Image.new("RGBA", (x2 - x1, y2 - y1), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay, "RGBA")
    for i in range(9):
      od.arc((-160 + i * 92, -80, 420 + i * 92, 480), 190, 330, fill=(255, 255, 255, 42), width=8)
    od.rounded_rectangle((0, 0, x2 - x1 - 1, y2 - y1 - 1), radius=46, outline=(255, 238, 166, 230), width=7)
    base.alpha_composite(overlay, (x1, y1))


def render_card(pack: dict, card: dict) -> dict:
    pack_id = pack["pack_id"]
    theme = PACK_THEMES[pack_id]
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    add_card_shadow(img)
    d = ImageDraw.Draw(img, "RGBA")

    d.rounded_rectangle((72, 64, 952, 1348), radius=70, fill=(246, 204, 84, 255), outline=(111, 68, 16, 255), width=8)
    d.rounded_rectangle((90, 82, 934, 1330), radius=58, fill=(128, 8, 15, 255), outline=(255, 236, 153, 255), width=8)
    d.rounded_rectangle((118, 110, 906, 1302), radius=44, fill=(255, 247, 221, 255), outline=(232, 183, 63, 255), width=8)
    d.rounded_rectangle((144, 142, 880, 1272), radius=34, fill=(254, 241, 204, 255), outline=theme["rail"] + (255,), width=8)

    for i in range(22):
        x = 130 + (i * 67) % 750
        y = 126 + (i * 149) % 1120
        draw_sparkle(d, x, y, (255, 224, 94, 95))

    d.rounded_rectangle((158, 154, 300, 214), radius=24, fill=(255, 217, 91, 255), outline=(121, 79, 20, 255), width=4)
    draw_center(d, (158, 154, 300, 214), "עונה 1", font(32, True), (55, 44, 30, 255))
    d.rounded_rectangle((668, 154, 856, 214), radius=24, fill=(255, 217, 91, 255), outline=(121, 79, 20, 255), width=4)
    draw_center(d, (668, 154, 856, 214), "בנק הפועלים", font(28, True), (55, 44, 30, 255))

    draw_center(d, (220, 212, 804, 292), "אוספים עובדות", font(68, True), (255, 226, 117, 255), 4, (79, 42, 8, 255))
    draw_poalim_mark(d, 828, 258, 54)

    d.rounded_rectangle((170, 304, 854, 398), radius=34, fill=(255, 248, 226, 255), outline=(177, 111, 26, 255), width=5)
    title_font = fit_font(d, card["title_he"], 590, 58, True, 34)
    draw_center(d, (186, 304, 838, 398), card["title_he"], title_font, (54, 48, 43, 255))

    art_box = (160, 426, 864, 822)
    d.rounded_rectangle((art_box[0] - 12, art_box[1] - 12, art_box[2] + 12, art_box[3] + 12), radius=44, fill=(70, 44, 18, 255), outline=(255, 222, 106, 255), width=7)
    draw_game_art(img, d, pack_id, card["index"], art_box)

    facts = (card.get("facts_he") or [])[:3]
    while len(facts) < 3:
        facts.append(f"עובדה על {card['title_he']}")
    for idx, fact in enumerate(facts):
        y = 872 + idx * 112
        d.rounded_rectangle((152, y, 872, y + 84), radius=30, fill=(255, 247, 223, 255), outline=(174, 116, 35, 255), width=5)
        d.ellipse((176, y + 15, 230, y + 69), fill=theme["badge"] + (255,), outline=(98, 63, 18, 255), width=4)
        icon = ["₪", "%", "✓"][idx]
        draw_center(d, (176, y + 15, 230, y + 69), icon, font(30, True), (255, 255, 245, 255), 1, (34, 34, 34, 255))
        fact_font = fit_font(d, fact, 540, 31, True, 22)
        lines = wrap_text(d, fact, fact_font, 545, 2)
        line_h = fact_font.size + 6
        top = y + 42 - (line_h * len(lines)) / 2
        for line_index, line in enumerate(lines):
            draw_center(d, (260, int(top + line_index * line_h), 796, int(top + (line_index + 1) * line_h)), line, fact_font, (58, 52, 46, 255))
        draw_sparkle(d, 832, y + 42, (218, 151, 35, 255))

    d.rounded_rectangle((414, 1238, 610, 1302), radius=28, fill=(255, 217, 91, 255), outline=(116, 75, 16, 255), width=5)
    draw_center(d, (414, 1238, 610, 1302), f"{card['index']}/10", font(38, True), (61, 44, 27, 255))

    webp = ROOT / card["asset_path"]
    png = webp.with_suffix(".png")
    png.parent.mkdir(parents=True, exist_ok=True)
    img.save(png, "PNG")
    img.save(webp, "WEBP", quality=94, method=6)
    return {"card_id": card["card_id"], "png": str(png.relative_to(ROOT)), "webp": str(webp.relative_to(ROOT))}


def render_pack(pack: dict) -> dict:
    theme = PACK_THEMES[pack["pack_id"]]
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    shadow = Image.new("RGBA", (820, 1260), (0, 0, 0, 90))
    shadow.putalpha(rounded_mask(shadow.size, 62))
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    img.alpha_composite(shadow, (104, 88))

    d.rounded_rectangle((104, 70, 920, 1362), radius=58, fill=theme["rail"] + (255,), outline=(255, 222, 104, 255), width=8)
    for y in list(range(82, 150, 18)) + list(range(1280, 1350, 18)):
        for x in range(126, 900, 42):
            d.polygon([(x, y), (x + 20, y - 12), (x + 40, y)], fill=(255, 218, 104, 230))
    d.rounded_rectangle((132, 168, 892, 1238), radius=48, fill=(248, 214, 109, 255), outline=(111, 68, 16, 255), width=7)
    d.rounded_rectangle((154, 194, 870, 1214), radius=38, fill=(245, 249, 250, 255), outline=theme["rail"] + (255,), width=8)

    if SOURCE_PACK.exists():
        src = Image.open(SOURCE_PACK).convert("RGBA")
        crop = src.crop((58, 185, 454, 520)).resize((640, 540), Image.Resampling.LANCZOS)
        paste_rounded(img, crop, (192, 452, 832, 880), 34)
    else:
        art = gradient((640, 428), (255, 245, 222), theme["glow"])
        img.alpha_composite(art, (192, 452))
    d.rounded_rectangle((192, 452, 832, 880), radius=34, outline=(255, 226, 118, 255), width=7)

    draw_center(d, (206, 218, 818, 306), "אוספים עובדות", font(70, True), (255, 226, 118, 255), 4, (82, 48, 12, 255))
    draw_poalim_mark(d, 512, 368, 88)
    d.rounded_rectangle((196, 916, 828, 1012), radius=36, fill=(255, 248, 226, 255), outline=(160, 95, 24, 255), width=5)
    title = pack["pack_title_he"].replace("בנק הפועלים: ", "")
    title_font = fit_font(d, title, 560, 58, True, 34)
    draw_center(d, (216, 916, 808, 1012), title, title_font, (128, 16, 22, 255))
    d.rounded_rectangle((254, 1056, 770, 1134), radius=34, fill=(255, 248, 226, 255), outline=(160, 95, 24, 255), width=5)
    draw_center(d, (254, 1056, 770, 1134), "10 קלפי עובדות", font(44, True), (52, 46, 42, 255))
    d.rounded_rectangle((310, 1168, 714, 1228), radius=28, fill=theme["rail"] + (255,), outline=(255, 224, 110, 255), width=4)
    draw_center(d, (310, 1168, 714, 1228), "עונה 1 · בנקאות לילדים", font(30, True), (255, 255, 255, 255), 1, (80, 16, 20, 255))

    webp = ROOT / pack["pack_asset_path"]
    png = webp.with_suffix(".png")
    png.parent.mkdir(parents=True, exist_ok=True)
    img.save(png, "PNG")
    img.save(webp, "WEBP", quality=94, method=6)
    return {"pack_id": pack["pack_id"], "png": str(png.relative_to(ROOT)), "webp": str(webp.relative_to(ROOT))}


def main() -> None:
    index = json.loads(QUIZ_INDEX.read_text("utf-8"))
    rendered = {"schema_version": 1, "packs": [], "cards": []}
    for entry in index["packs"]:
        pack = json.loads((ROOT / entry["quiz_path"]).read_text("utf-8"))
        rendered["packs"].append(render_pack(pack))
        for card in pack["cards"]:
            rendered["cards"].append(render_card(pack, card))
    MANIFEST_PATH.write_text(json.dumps(rendered, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(json.dumps({"packs": len(rendered["packs"]), "cards": len(rendered["cards"]), "manifest": str(MANIFEST_PATH.relative_to(ROOT))}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
