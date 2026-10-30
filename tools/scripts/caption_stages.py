"""Put a 'what got better' panel under each land stage picture.
Usage: python3 -I caption_stages.py <stages_dir> <out_dir>"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
F = '/usr/share/fonts/opentype/inter/'
ft = ImageFont.truetype(F + 'Inter-Bold.otf', 46)
fl = ImageFont.truetype(F + 'Inter-SemiBold.otf', 28)
fb = ImageFont.truetype(F + 'Inter-Medium.otf', 37)
INK, MUTED, TEAL, PARCH, LINE = (58, 42, 29), (124, 101, 80), (30, 122, 117), (246, 238, 222), (227, 210, 178)
STAGES = {
    1: ('Town Hall 1', 'Where every new town starts', [
        'Oasis dying: pond half mud, waterfall dry',
        'Crops dead and plants dried out',
        'Homes are rough wooden shacks']),
    2: ('Town Hall 5', 'What got better', [
        'Waterfall flows again and the pond is refilling',
        '4 palms grow back on the left and right edges',
        'Crops and plants start to recover',
        'First home rebuilt in mud-brick']),
    3: ('Town Hall 8', 'What got better', [
        'Pond full again, the mud has gone',
        'Plants turning green, wheat golden again',
        '2 more homes rebuilt in mud-brick']),
    4: ('Town Hall 12', 'What got better', [
        'Oasis green again, water clearer',
        'Fields healthy',
        'Last 2 homes rebuilt: every home is mud-brick']),
    5: ('Town Hall 17', 'What got better', [
        '6 palms planted along the road to the Town Hall',
        '2 palms grow back by the oasis (7 in total)',
        'Oasis greener, water clearer']),
    6: ('Town Hall 22', 'What got better', [
        'Swamp starts to clear: lily pads and reed clumps gone from the water',
        '2 more palms by the oasis (9 in total)',
        'Water cleaner']),
    7: ('Town Hall 28', 'What got better', [
        'Dry yellow reeds turn fresh green',
        'Palm grove planted inside the gate (4 palms)',
        'First 2 homes whitewashed']),
    8: ('Town Hall 34', 'What got better', [
        'Avenue paved from the gate to the Town Hall',
        'Pool water clearer',
        '3rd home whitewashed']),
    9: ('Town Hall 41', 'What got better', [
        'Pool water clear turquoise',
        'All 5 homes whitewashed',
        'Town plants greener']),
    10: ('Town Hall 45', 'What got better', [
        'Flowering bushes all round the pool',
        'A garden beside every home',
        'Oasis and fields at their richest']),
    11: ('Town Hall 50', 'What got better', [
        'Flowering bushes at the avenue and the plaza',
        'Warm golden light over the whole town',
        'The finest the land gets']),
}
for k, (title, label, bullets) in STAGES.items():
    pic = Image.open(src / f'stage_{k:02d}.png').convert('RGB')
    W = pic.width
    pad, lh = 44, 56
    panel_h = pad + 58 + 18 + 40 + 14 + lh * len(bullets) + pad - 10
    out_im = Image.new('RGB', (W, pic.height + panel_h), PARCH)
    out_im.paste(pic, (0, 0))
    d = ImageDraw.Draw(out_im)
    y = pic.height
    d.line((0, y, W, y), fill=LINE, width=3)
    y += pad
    step = f'{k} of 11'
    d.text((pad, y), title, font=ft, fill=INK)
    tw = d.textlength(title, font=ft)
    sl = d.textlength(step, font=fl)
    d.rounded_rectangle((pad + tw + 24, y + 6, pad + tw + 24 + sl + 30, y + 52), radius=23, outline=TEAL, width=3)
    d.text((pad + tw + 39, y + 12), step, font=fl, fill=TEAL)
    y += 58 + 18
    d.text((pad, y), label.upper(), font=fl, fill=MUTED if k == 1 else TEAL)
    y += 40 + 14
    for b in bullets:
        d.ellipse((pad + 2, y + 15, pad + 16, y + 29), fill=TEAL if k > 1 else MUTED)
        d.text((pad + 34, y), b, font=fb, fill=INK)
        y += lh
    out_im.save(out / f'AZMARA_land_{k:02d}.jpg', quality=90)
print('captioned', len(STAGES))
