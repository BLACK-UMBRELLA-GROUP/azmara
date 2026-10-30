"""Side-by-side review crops (before | after) with the mask outline on the after side.
Usage: python3 -I review_views.py <before.png> <after.png> <mask.png> <out_prefix>"""
import sys
import numpy as np, cv2
a, b, m = cv2.imread(sys.argv[1]), cv2.imread(sys.argv[2]), cv2.imread(sys.argv[3], 0)
pre = sys.argv[4]
regions = {'west': (380, 520, 700, 780), 'east': (930, 530, 1250, 840)}
for k, (x0, y0, x1, y1) in regions.items():
    s = 1.6
    ca = cv2.resize(a[y0:y1, x0:x1], None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
    cb = cv2.resize(b[y0:y1, x0:x1], None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
    mm = cv2.resize(m[y0:y1, x0:x1], None, fx=s, fy=s, interpolation=cv2.INTER_NEAREST)
    cnts, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cm = cb.copy()
    cv2.drawContours(cm, cnts, -1, (255, 0, 255), 1)
    gap = np.full((ca.shape[0], 10, 3), 40, np.uint8)
    cv2.imwrite(f'{pre}_{k}.png', np.hstack([ca, gap, cb, gap, cm]))
