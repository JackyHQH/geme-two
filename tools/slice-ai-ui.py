from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/art/ai-ui/source/piece-spritesheet-v1.png"
OUT = ROOT / "assets/art/ai-ui/tiles"
PREVIEW = ROOT / "assets/art/ai-ui/preview/piece-tiles-preview.png"

NAMES = [
    "grass",
    "flower",
    "tree",
    "house",
    "courtyard",
    "town",
    "castle",
]


def main() -> None:
    image = Image.open(SOURCE).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)

    tile_size = 245
    target_size = 256
    step_x = 233
    start_x = 10
    row_y = [180, 466]

    tiles = []
    for row, y in enumerate(row_y):
        for col, name in enumerate(NAMES):
            x = start_x + col * step_x
            crop = image.crop((x, y, x + tile_size, y + tile_size)).resize((target_size, target_size), Image.Resampling.LANCZOS)
            suffix = "advanced" if row == 1 else "normal"
            filename = f"piece-{name}-{suffix}.png"
            crop.save(OUT / filename)
            tiles.append((filename, crop))

    preview_cols = 7
    gap = 18
    label_h = 28
    preview = Image.new("RGB", (preview_cols * target_size + (preview_cols + 1) * gap, 2 * (target_size + label_h) + 3 * gap), "#fff3d8")
    for index, (filename, tile) in enumerate(tiles):
        col = index % preview_cols
        row = index // preview_cols
        x = gap + col * (target_size + gap)
        y = gap + row * (target_size + label_h + gap)
        preview.paste(tile, (x, y))

    preview.save(PREVIEW)
    print(f"Sliced {len(tiles)} PNG tiles to {OUT}")


if __name__ == "__main__":
    main()
