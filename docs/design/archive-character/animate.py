"""Build a transparent breathing/blinking loop from the two approved poses."""
from pathlib import Path
import ast
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SIZE = (384, 576)

# Reuse the anime-denoise skill's L0 implementation without its unavailable
# neural-model dependencies. Preserve alpha throughout processing.
skill = Path.home() / '.codex/skills/gpt-anime-denoise/denoise.py'
tree = ast.parse(skill.read_text(encoding='utf-8'))
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'l0_smooth')
scope = {'np': np}
exec(compile(ast.Module(body=[function], type_ignores=[]), str(skill), 'exec'), scope)

def load(name):
    image = Image.open(HERE / name).convert('RGBA').resize(SIZE, Image.Resampling.LANCZOS)
    rgb = scope['l0_smooth'](np.asarray(image.convert('RGB'), dtype=float) / 255, 0.0005)
    clean = Image.fromarray(np.uint8(np.clip(rgb * 255 + 0.5, 0, 255))).convert('RGBA')
    clean.putalpha(image.getchannel('A'))
    return clean

opened = load('character-archive.png')
closed = load('character-archive-blink.png')
mask = Image.new('L', SIZE)
draw = ImageDraw.Draw(mask)
for box in [(370, 428, 485, 505), (540, 428, 650, 505)]:
    draw.rectangle(tuple(round(v * 0.375) for v in box), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(2))
blinked = Image.composite(closed, opened, mask)
opened.save(ROOT / 'public/assets/character-archive-still.png')

def blink(t):
    for center in (2.15, 6.1):
        distance = abs(t - center)
        if distance <= 0.05:
            return 1.0
        if distance < 0.15:
            return (0.15 - distance) / 0.10
    return 0.0

def breathe(image, t):
    phase = math.sin(2 * math.pi * t / 4)
    mesh = []
    # A continuous, small deformation anchored at the seat; books and feet
    # below it remain still, rather than bouncing the entire illustration.
    anchor = 357
    for y in range(0, SIZE[1], 4):
        bottom = min(y + 4, SIZE[1])
        def point(x, row):
            weight = max(0, 1 - row / anchor)
            weight = math.sin(weight * math.pi / 2) ** 2
            return (192 + (x - 192) / (1 + 0.002 * phase * weight), row + 1.2 * phase * weight)
        mesh.append(((0, y, SIZE[0], bottom), (*point(0, y), *point(0, bottom), *point(SIZE[0], bottom), *point(SIZE[0], y))))
    return image.convert('RGBa').transform(SIZE, Image.Transform.MESH, mesh, Image.Resampling.BICUBIC).convert('RGBA')

frames = [breathe(Image.blend(opened, blinked, blink(i / 20)), i / 20) for i in range(160)]
webp = ROOT / 'public/assets/character-archive-breathing-blink.webp'
frames[0].save(webp, save_all=True, append_images=frames[1:], duration=50, loop=0, quality=85, method=4)

# GIF uses binary transparency. Reserve palette index 255 for transparent pixels.
palette = opened.convert('RGB').quantize(colors=255)
gif_frames = []
for frame in frames:
    quantized = frame.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE)
    quantized.paste(255, mask=frame.getchannel('A').point(lambda a: 255 if a < 128 else 0))
    quantized.info['transparency'] = 255
    gif_frames.append(quantized)
gif = HERE / 'character-archive-breathing-blink.gif'
gif_frames[0].save(gif, save_all=True, append_images=gif_frames[1:], duration=50, loop=0, transparency=255, disposal=2, optimize=False)

for path in (webp, gif):
    with Image.open(path) as result:
        assert result.n_frames == 160
        assert result.size == SIZE
        assert result.info['loop'] == 0
        for index in range(result.n_frames):
            result.seek(index)
            result.load()
    print(f'Validated: {path} ({path.stat().st_size:,} bytes, 160 frames, 8s loop)')
