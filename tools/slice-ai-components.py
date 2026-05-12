from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/art/ai-ui/source/ui-components-spritesheet-v1.png"
OUT = ROOT / "assets/art/ai-ui/components"
PREVIEW = ROOT / "assets/art/ai-ui/preview/ui-components-preview.png"

COMPONENTS = [
    ("title-sign", (20, 88, 530, 250), (510, 240)),
    ("windmill-card", (575, 82, 250, 280), (250, 280)),
    ("stat-panel-green", (834, 86, 205, 300), (205, 300)),
    ("stat-panel-gold", (1080, 86, 205, 300), (205, 300)),
    ("stat-panel-blue", (1318, 86, 205, 300), (205, 300)),
    ("currency-coin", (40, 394, 430, 126), (430, 126)),
    ("currency-star", (40, 546, 430, 126), (430, 126)),
    ("cell-empty", (498, 434, 225, 240), (256, 256)),
    ("cell-highlight", (750, 428, 230, 248), (256, 256)),
    ("bottom-tray", (1000, 428, 510, 288), (680, 384)),
    ("button-undo", (72, 737, 224, 198), (224, 198)),
    ("button-restart", (363, 737, 224, 198), (224, 198)),
    ("button-pause", (646, 737, 224, 198), (224, 198)),
    ("button-sound", (925, 737, 224, 198), (224, 198)),
    ("button-settings", (1214, 737, 224, 198), (224, 198)),
]


def main() -> None:
    image = Image.open(SOURCE).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)

    rendered = []
    for name, (x, y, w, h), target in COMPONENTS:
        crop = image.crop((x, y, x + w, y + h)).resize(target, Image.Resampling.LANCZOS)
        path = OUT / f"{name}.png"
        crop.save(path)
        rendered.append((name, crop))

    canvas_w = 1440
    canvas_h = 980
    preview = Image.new("RGB", (canvas_w, canvas_h), "#fff3d8")
    positions = [
        (30, 36), (570, 36), (830, 36), (1050, 36), (1265, 36),
        (30, 356), (30, 508), (500, 356), (780, 356), (1040, 356),
        (72, 760), (350, 760), (630, 760), (910, 760), (1190, 760),
    ]
    for (name, crop), (x, y) in zip(rendered, positions):
        preview.paste(crop, (x, y))

    preview.save(PREVIEW)
    print(f"Sliced {len(rendered)} UI component PNGs to {OUT}")


if __name__ == "__main__":
    main()
