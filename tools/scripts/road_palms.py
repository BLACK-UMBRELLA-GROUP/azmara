"""Remove the 6 palms along the road to the Town Hall (crowns, trunks, base tufts and their shadows).
Usage: python3 -I road_palms.py <in.png> <big-lama.pt> <out.png> <mask_out.png>"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import numpy as np, cv2
from lama import inpaint
src, model_path, out, mask_out = sys.argv[1:5]
img = cv2.imread(src); h, w = img.shape[:2]
lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab); hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
non_sand = ((hsv[..., 2] < 178) | (lab[..., 1] < 138)).astype(np.uint8) * 255
L = lab[..., 0]
bg = cv2.medianBlur(L, 61).astype(np.int16)
darker = ((bg - L.astype(np.int16)) > 9).astype(np.uint8) * 255

def boxmask(x0, y0, x1, y1):
    m = np.zeros((h, w), np.uint8); m[y0:y1, x0:x1] = 255; return m

# palm bodies: crown box, trunk/base box (master pixel coordinates)
PALMS = {
    'R1': [(662, 128, 738, 192), (676, 184, 726, 214)],
    'R4': [(800, 128, 874, 192), (810, 184, 864, 214)],
    'R2': [(655, 212, 730, 278), (664, 258, 726, 300)],
    'R5': [(802, 212, 878, 276), (814, 258, 868, 298)],
    'R3': [(647, 312, 727, 378), (660, 368, 712, 399)],
    'R6': [(807, 312, 887, 378), (820, 368, 872, 399)],
}
# shadows (cast to the lower left), searched inside these boxes
SHADOWS = [(596, 200, 700, 240), (734, 196, 812, 234), (580, 276, 700, 320),
           (734, 274, 822, 318), (560, 376, 682, 420), (734, 372, 824, 399)]
KEEP_OUT = [(0, 0, w, 127), (786, 372, 826, 430), (676, 399, 880, 440)]  # fence, banner, roof

mask = np.zeros((h, w), np.uint8)
for boxes in PALMS.values():
    body = np.zeros((h, w), np.uint8)
    for b in boxes:
        body |= cv2.bitwise_and(non_sand, boxmask(*b))
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    mask |= cv2.dilate(body, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
for b in SHADOWS:
    s = cv2.bitwise_and(darker, boxmask(*b))
    s = cv2.morphologyEx(s, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    s = cv2.morphologyEx(s, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    mask |= cv2.dilate(s, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
for b in KEEP_OUT:
    mask[b[1]:b[3], b[0]:b[2]] = 0
cv2.imwrite(mask_out, mask)
res = inpaint(img, mask, model_path)
cv2.imwrite(out, res)
print('masked %:', round((mask > 0).mean() * 100, 2))
