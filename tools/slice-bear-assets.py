from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/art/ai-ui/characters/source/bear-items-spritesheet-v1.png"
OUT = ROOT / "assets/art/ai-ui/characters/sprites"
PREVIEW = ROOT / "assets/art/ai-ui/characters/preview/bear-items-preview.png"

SPRITES = [
    ("bear-idle-01", (52, 130, 270, 330), (256, 256)),
    ("bear-idle-02", (350, 130, 270, 330), (256, 256)),
    ("bear-walk-right-01", (642, 105, 270, 350), (256, 256)),
    ("bear-walk-right-02", (940, 105, 270, 350), (256, 256)),
    ("bear-walk-right-03", (1225, 105, 270, 350), (256, 256)),
    ("bear-walk-left-01", (48, 585, 270, 350), (256, 256)),
    ("bear-walk-left-02", (350, 585, 270, 350), (256, 256)),
    ("bear-walk-left-03", (640, 585, 270, 350), (256, 256)),
    ("bear-tombstone", (932, 600, 250, 260), (256, 256)),
    ("money-bag", (1220, 560, 270, 300), (256, 256)),
]


def remove_magenta(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    key = (255.0, 0.0, 255.0)
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            distance = ((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2) ** 0.5
            if distance < 72:
                pixels[x, y] = (255, 0, 255, 0)
            elif distance < 190:
                alpha = max(0.0, min(1.0, (distance - 72) / 118))
                if alpha <= 0.02:
                    pixels[x, y] = (255, 0, 255, 0)
                else:
                    nr = int(max(0, min(255, (r - (1 - alpha) * key[0]) / alpha)))
                    ng = int(max(0, min(255, (g - (1 - alpha) * key[1]) / alpha)))
                    nb = int(max(0, min(255, (b - (1 - alpha) * key[2]) / alpha)))
                    pixels[x, y] = (nr, ng, nb, int(a * alpha))
    return rgba


def main() -> None:
    sheet = Image.open(SOURCE)
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)

    rendered = []
    for name, box, size in SPRITES:
        x, y, w, h = box
        crop = sheet.crop((x, y, x + w, y + h))
        sprite = remove_magenta(crop).resize(size, Image.Resampling.LANCZOS)
        sprite.save(OUT / f"{name}.png")
        rendered.append((name, sprite))

    tile = 256
    gap = 18
    cols = 5
    rows = 2
    preview = Image.new("RGBA", (cols * tile + (cols + 1) * gap, rows * tile + (rows + 1) * gap), "#fff3d8ff")
    for index, (_, sprite) in enumerate(rendered):
        x = gap + (index % cols) * (tile + gap)
        y = gap + (index // cols) * (tile + gap)
        preview.alpha_composite(sprite, (x, y))
    preview.convert("RGB").save(PREVIEW)
    print(f"Sliced {len(rendered)} transparent sprites to {OUT}")


if __name__ == "__main__":
    main()
