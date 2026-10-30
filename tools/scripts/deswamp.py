"""Clear the swamp look from the full green oasis (V1), in two steps.
A (Town Hall 22): lily pads and the reed clumps standing in the open water are removed.
B (Town Hall 28): also the reed tufts in the shallows along the bottom edge and the lower part
   of the big reed bank on the right. Palms and the bank plants stay.
Nearby reeds are hidden from the fill model so it paints open water instead of new reeds.
Usage: python3 -I deswamp.py <v1.png> <big-lama.pt> <out_dir>"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import numpy as np, cv2
from lama import inpaint
src, model, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
v1 = cv2.imread(src); h, w = v1.shape[:2]

def poly(*pts):
    m = np.zeros((h, w), np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 255); return m
def ell(cx, cy, rx, ry):
    m = np.zeros((h, w), np.uint8); cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1); return m

keep = np.zeros((h, w), np.uint8)   # palms that must never be touched
for (cx, cy, rx, ry), (x0, y0, x1, y1) in [((961, 881, 40, 34), (950, 898, 982, 954)),
                                          ((1025, 820, 48, 40), (1006, 840, 1042, 905)),
                                          ((591, 607, 55, 48), (566, 640, 600, 728))]:
    keep |= ell(cx, cy, rx, ry); keep[y0:y1, x0:x1] = 255

A = (poly((640, 742), (702, 742), (704, 840), (640, 842)) |            # reed clump, left
     poly((698, 755), (782, 755), (784, 848), (698, 850)) |            # reed island, centre
     poly((836, 812), (898, 812), (900, 892), (834, 892)) |            # reed clump, right
     ell(648, 864, 62, 42) |                                           # lily pads, left
     poly((794, 826), (868, 826), (868, 888), (794, 888)) |            # lily pads, lower right
     poly((864, 796), (964, 796), (964, 834), (864, 834)))             # lily pads, right strip
A &= ~keep
B_extra = (poly((598, 902), (700, 896), (790, 902), (880, 893), (940, 900), (936, 972),
                (860, 998), (760, 1000), (680, 994), (606, 978)) |      # tufts in the shallows, bottom
           poly((884, 735), (932, 726), (968, 742), (970, 802), (932, 812), (884, 806)))  # right reed bank, lower part
B_extra &= ~keep & ~A
# hide the remaining reeds around the pond from the model (not pasted back)
ctx = (poly((556, 730), (644, 730), (646, 870), (556, 870)) |          # left bank reeds
       poly((880, 600), (1000, 600), (1000, 810), (880, 810)) |        # right reed bank
       poly((590, 900), (950, 890), (950, 1024), (590, 1024)))         # bottom tufts
ctx &= ~keep
cv2.imwrite(str(out / 'mask_A.png'), A); cv2.imwrite(str(out / 'mask_B.png'), A | B_extra)
imA = inpaint(v1, A, model, ctx_mask=ctx & ~A)
cv2.imwrite(str(out / 'v1_A.png'), imA)
ctxB = (poly((556, 730), (644, 730), (646, 870), (556, 870)) | poly((970, 600), (1000, 600), (1000, 810), (970, 810))) & ~keep
imB = inpaint(imA, B_extra, model, ctx_mask=ctxB & ~B_extra)
cv2.imwrite(str(out / 'v1_B.png'), imB)
print('A %', round((A > 0).mean() * 100, 2), '| B extra %', round((B_extra > 0).mean() * 100, 2))
