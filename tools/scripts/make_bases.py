"""Structural bases for the worse options (LaMa removals on top of the road-palm edit).
B (option 4): + left/right mid-edge palms gone, waterfall dried (oasis palms stay, they die instead).
C (option 5): B + oasis palms P7, P8 gone, lower-left edge palm gone.
Usage: python3 -I make_bases.py <step_road.png> <big-lama.pt> <cascade_mask.png> <out_dir>"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import numpy as np, cv2
from lama import inpaint
src, model_path, casc_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3], pathlib.Path(sys.argv[4])
img = cv2.imread(src); h, w = img.shape[:2]
lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab); hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
non_sand = ((hsv[..., 2] < 178) | (lab[..., 1] < 138)).astype(np.uint8) * 255
K = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))

def ell(cx, cy, rx, ry):
    m = np.zeros((h, w), np.uint8); cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1); return m
def box(x0, y0, x1, y1):
    m = np.zeros((h, w), np.uint8); m[y0:y1, x0:x1] = 255; return m
def on_sand_palm(boxes, keep_out=()):
    m = np.zeros((h, w), np.uint8)
    for b in boxes:
        m |= non_sand & box(*b)
    m = cv2.dilate(cv2.morphologyEx(m, cv2.MORPH_CLOSE, K(9)), K(9))
    for b in keep_out:
        m[b[1]:b[3], b[0]:b[2]] = 0
    return m
def veg_palm(crown, trunk):
    m = ell(*crown) | box(*trunk)
    return cv2.dilate(m, K(7))

# --- option 4 removals
m4 = np.zeros((h, w), np.uint8)
m4 |= on_sand_palm([(0, 455, 135, 705)])                             # left mid-edge pair
m4 |= on_sand_palm([(1385, 495, 1536, 655), (1448, 590, 1472, 668), (1493, 630, 1517, 700)])  # right mid-edge pair
casc = cv2.dilate(cv2.imread(casc_path, 0), K(7))
m4 |= casc                                                            # waterfall -> dry rocks
base4 = inpaint(img, m4, model_path)
cv2.imwrite(str(out_dir / 'base_opt4.png'), base4); cv2.imwrite(str(out_dir / 'mask_opt4.png'), m4)

# --- option 5 extra removals (on top of option 4)
m5 = np.zeros((h, w), np.uint8)
m5 |= veg_palm((961, 881, 37, 31), (958, 905, 975, 948))            # P7
m5 |= veg_palm((1108, 885, 57, 41), (1094, 918, 1112, 970))         # P8
m5 |= on_sand_palm([(45, 690, 140, 795)])                           # lower-left edge palm
base5 = inpaint(base4, m5, model_path)
cv2.imwrite(str(out_dir / 'base_opt5.png'), base5); cv2.imwrite(str(out_dir / 'mask_opt5.png'), m5 | m4)
print('opt4 masked %', round((m4 > 0).mean() * 100, 2), 'opt5 extra %', round((m5 > 0).mean() * 100, 2))
