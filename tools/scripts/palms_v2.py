"""Remove the outer palms (P1, P3, P4, P5) from the locked master with LaMa.
Masks hug each palm: ellipse around the crown, keep only non-sand pixels inside it,
plus a trunk box. Only masked pixels change.
Usage: python3 -I palms_v2.py <master.png> <big-lama.pt> <out_dir>"""
import sys, pathlib
import numpy as np, cv2, torch
src, model_path, out_dir = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)
img = cv2.imread(src)
h, w = img.shape[:2]
lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
non_sand = ((hsv[..., 2] < 178) | (lab[..., 1] < 138)).astype(np.uint8) * 255

def ell(cx, cy, rx, ry):
    m = np.zeros((h, w), np.uint8)
    cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    return m

def box(x0, y0, x1, y1):
    m = np.zeros((h, w), np.uint8)
    cv2.rectangle(m, (x0, y0), (x1, y1), 255, -1)
    return m

PALMS = {
    'P1': dict(crown=(506, 592, 54, 52), trunk=(508, 615, 524, 650), keep_out=[(592, 607, 55, 47)]),
    'P3': dict(crown=(472, 670, 60, 48), trunk=None, keep_out=[]),
    'P4': dict(crown=(1021, 601, 53, 48), trunk=(1006, 640, 1024, 672), keep_out=[]),
    'P5': dict(crown=(1114, 712, 58, 46), trunk=(1098, 748, 1120, 800), keep_out=[]),
}
mask = np.zeros((h, w), np.uint8)
k5 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
for name, p in PALMS.items():
    e = ell(*p['crown'])
    part = cv2.bitwise_and(non_sand, e)
    part = cv2.morphologyEx(part, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    part = cv2.dilate(part, k5)
    part = cv2.bitwise_and(part, cv2.dilate(e, k5))
    if p['trunk']:
        part = cv2.bitwise_or(part, cv2.dilate(box(*p['trunk']), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))))
    for ko in p['keep_out']:
        part = cv2.bitwise_and(part, cv2.bitwise_not(ell(*ko)))
    mask = cv2.bitwise_or(mask, part)
cv2.imwrite(str(out_dir / 'mask.png'), mask)

model = torch.jit.load(model_path, map_location='cpu').eval()
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
ph, pw = (8 - h % 8) % 8, (8 - w % 8) % 8
rgb_p = np.pad(rgb, ((0, ph), (0, pw), (0, 0)), mode='symmetric')
mask_p = np.pad(mask, ((0, ph), (0, pw)), mode='symmetric')
t_img = torch.from_numpy(rgb_p).permute(2, 0, 1).float()[None] / 255.0
t_mask = (torch.from_numpy(mask_p).float()[None, None] / 255.0 > 0.5).float()
with torch.no_grad():
    out = model(t_img, t_mask)
res = (out[0].permute(1, 2, 0).numpy() * 255).clip(0, 255).astype(np.uint8)[:h, :w]
res = cv2.cvtColor(res, cv2.COLOR_RGB2BGR)
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), 2)[..., None]
final = (img.astype(np.float32) * (1 - soft) + res.astype(np.float32) * soft).round().astype(np.uint8)
cv2.imwrite(str(out_dir / 'master_fewer_palms.png'), final)
changed = (np.abs(final.astype(int) - img.astype(int)).sum(axis=2) > 0).mean() * 100
print('done', f'changed pixels: {changed:.2f}%')
