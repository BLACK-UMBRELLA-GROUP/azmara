"""Second pass: clear the soft 'ghost' left of the kept palm (P2) where P1 used to be.
LaMa sees P2's crown hidden too, so it fills sand instead of copying fronds;
only the ghost area is pasted back.
Usage: python3 -I fix_ghost.py <v2.png> <v2_mask.png> <big-lama.pt> <out_dir>"""
import sys, pathlib
import numpy as np, cv2, torch
src, mpath, model_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3], pathlib.Path(sys.argv[4])
img = cv2.imread(src); h, w = img.shape[:2]
m1 = cv2.imread(mpath, 0)
ghost = np.zeros((h, w), np.uint8)
ghost[545:640, 480:566] = m1[545:640, 480:566]
ghost = cv2.dilate(ghost, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
ctx = ghost.copy()
cv2.ellipse(ctx, (595, 610), (62, 55), 0, 0, 360, 255, -1)  # hide P2's crown from the model
model = torch.jit.load(model_path, map_location='cpu').eval()
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
ph, pw = (8 - h % 8) % 8, (8 - w % 8) % 8
t_img = torch.from_numpy(np.pad(rgb, ((0, ph), (0, pw), (0, 0)), mode='symmetric')).permute(2, 0, 1).float()[None] / 255.0
t_mask = (torch.from_numpy(np.pad(ctx, ((0, ph), (0, pw)), mode='symmetric')).float()[None, None] / 255.0 > 0.5).float()
with torch.no_grad():
    out = model(t_img, t_mask)
res = cv2.cvtColor((out[0].permute(1, 2, 0).numpy() * 255).clip(0, 255).astype(np.uint8)[:h, :w], cv2.COLOR_RGB2BGR)
soft = cv2.GaussianBlur(ghost.astype(np.float32) / 255.0, (0, 0), 2)[..., None]
final = (img.astype(np.float32) * (1 - soft) + res.astype(np.float32) * soft).round().astype(np.uint8)
cv2.imwrite(str(out_dir / 'master_fewer_palms_b.png'), final)
mask_all = cv2.bitwise_or(m1, ghost)
cv2.imwrite(str(out_dir / 'mask_all.png'), mask_all)
print('ghost px', int((ghost > 0).sum()))
