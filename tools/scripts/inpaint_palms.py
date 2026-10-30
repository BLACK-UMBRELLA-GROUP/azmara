"""Remove some palms by the oasis from the locked town master with LaMa inpainting.

Only masked pixels change; everything else is copied back from the original.
Usage: python3 -I inpaint_palms.py <master.png> <big-lama.pt> <out_dir>
"""
import sys
import pathlib
import numpy as np
import cv2
import torch

src, model_path, out_dir = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)

img_bgr = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = img_bgr.shape[:2]
mask = np.zeros((h, w), np.uint8)

# Palms to remove (crown ellipse + trunk box), in master pixel coordinates.
PALMS = {
    'P2': dict(crown=((588, 625), (68, 64)), trunk=(560, 680, 597, 732)),
    'P3': dict(crown=((482, 684), (62, 52)), trunk=None),
    'P5': dict(crown=((1117, 718), (70, 58)), trunk=(1097, 752, 1124, 806)),
    'P7': dict(crown=((960, 882), (46, 43)), trunk=(953, 898, 987, 952)),
    'P8': dict(crown=((1108, 902), (58, 48)), trunk=(1090, 928, 1117, 992)),
}
for p in PALMS.values():
    (cx, cy), (rx, ry) = p['crown']
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    if p['trunk']:
        x0, y0, x1, y1 = p['trunk']
        cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
cv2.imwrite(str(out_dir / 'mask.png'), mask)

model = torch.jit.load(model_path, map_location='cpu')
model.eval()
rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
pad_h, pad_w = (8 - h % 8) % 8, (8 - w % 8) % 8
rgb_p = np.pad(rgb, ((0, pad_h), (0, pad_w), (0, 0)), mode='symmetric')
mask_p = np.pad(mask, ((0, pad_h), (0, pad_w)), mode='symmetric')
t_img = torch.from_numpy(rgb_p).permute(2, 0, 1).float().unsqueeze(0) / 255.0
t_mask = (torch.from_numpy(mask_p).float().unsqueeze(0).unsqueeze(0) / 255.0 > 0.5).float()
with torch.no_grad():
    out = model(t_img, t_mask)
res = (out[0].permute(1, 2, 0).numpy() * 255).clip(0, 255).astype(np.uint8)[:h, :w]
res_bgr = cv2.cvtColor(res, cv2.COLOR_RGB2BGR)

# Feathered composite so only the masked areas change.
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), 3)[..., None]
final = (img_bgr.astype(np.float32) * (1 - soft) + res_bgr.astype(np.float32) * soft).round().astype(np.uint8)
cv2.imwrite(str(out_dir / 'master_fewer_palms.png'), final)
changed = (np.abs(final.astype(int) - img_bgr.astype(int)).sum(axis=2) > 0).mean() * 100
print('done', final.shape, f'changed pixels: {changed:.2f}%')
