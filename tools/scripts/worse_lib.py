"""Building blocks for the 'worse Level 1' options. All edits are local recolours or LaMa fills;
the drawing itself (layout, buildings, paths) is never repainted."""
import numpy as np, cv2

def lab_planes(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab).astype(np.float32)
    return lab[..., 0], lab[..., 1], lab[..., 2]

def to_bgr(L, A, B):
    lab = np.dstack([L, A, B]).clip(0, 255).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_Lab2BGR)

def water_masks(img):
    """Return (pond, channels, cascade) as uint8 0/255 masks."""
    h, w = img.shape[:2]
    L, A, B = lab_planes(img)
    Sat = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[..., 1].astype(np.float32)
    k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
    cand = ((A < 124) & (Sat < 160) & (L > 40)).astype(np.uint8) * 255
    region = np.zeros((h, w), np.uint8)
    cv2.rectangle(region, (585, 700), (1010, 1023), 255, -1)
    opened = cv2.morphologyEx(cand & region, cv2.MORPH_OPEN, k(5))
    n, lab, st, _ = cv2.connectedComponentsWithStats(opened)
    pond = np.zeros((h, w), np.uint8)
    for sx, sy in [(700, 740), (800, 800), (640, 870), (700, 900), (860, 820), (900, 870), (800, 880), (760, 990), (720, 960)]:
        i = lab[sy, sx]
        if i > 0:
            pond[lab == i] = 255
    pond = cv2.morphologyEx(pond, cv2.MORPH_CLOSE, k(7))
    # fill small holes (lily pads, ripples); keep big ones (reed islands)
    inv = cv2.bitwise_not(pond)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    for i in range(1, n2):
        if st2[i][4] < 500:
            pond[lab2 == i] = 255
    # irrigation channels: hand-traced strips, keep only the greener (water) pixels inside
    strips = np.zeros((h, w), np.uint8)
    for (xa, ya), (xb, yb), wd in [((1147, 822), (1225, 972), 16), ((1130, 800), (1290, 778), 14),
                                   ((400, 840), (307, 973), 16), ((127, 767), (400, 800), 14), ((27, 833), (0, 920), 16)]:
        cv2.line(strips, (xa, ya), (xb, yb), 255, wd)
    chan = ((A < 131) & (L > 70)).astype(np.uint8) * 255 & strips
    channels = cv2.morphologyEx(chan, cv2.MORPH_CLOSE, k(5))
    cascade = np.zeros((h, w), np.uint8)
    c2 = ((B < 150) & (A < 133) & (L > 80) & (Sat < 120)).astype(np.uint8) * 255
    cascade[640:725, 740:800] = c2[640:725, 740:800]
    cascade = cv2.morphologyEx(cascade, cv2.MORPH_CLOSE, k(5))
    return pond, channels, cascade

def veg_weight(img, exclude=None):
    """Soft 0..1 weight of green/olive plant pixels (palms, reeds, bushes, crops, lily pads)."""
    L, A, B = lab_planes(img)
    w = np.clip((134.0 - A) / 8.0, 0, 1) * np.clip((B - 135.0) / 6.0, 0, 1)
    if exclude is not None:
        w *= 1 - (exclude > 0)
    return cv2.GaussianBlur(w, (0, 0), 0.8)

def dry_plants(img, s, weight=None, brown=0.0):
    """s: 0..1 how dry. brown: 0..1 extra push from straw to dead brown."""
    L, A, B = lab_planes(img)
    w = (veg_weight(img) if weight is None else weight) * s
    # straw: warmer (a* up), more yellow (b* up), a little lighter
    A2 = A + w * (139.0 - A) * 0.95
    B2 = B + w * 9.0
    L2 = L + w * np.clip(L * 0.10, 0, 14)
    if brown > 0:
        wb = w * brown
        A2 = A2 + wb * 3.0
        B2 = B2 - wb * 14.0
        L2 = L2 - wb * L2 * 0.18
    return to_bgr(L2, A2, B2)

def murky_water(img, mask, s):
    """Swampy, stagnant water: olive-brown, flatter, darker."""
    L, A, B = lab_planes(img)
    m = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), 1.2) * s
    Lm = cv2.GaussianBlur(L, (0, 0), 2.0)
    L2 = L + m * ((Lm * 0.82 + L * 0.18) * 0.80 - L)
    A2 = A + m * (131.0 - A)
    B2 = B + m * (152.0 - B)
    return to_bgr(L2, A2, B2)

def _cracks(shape, bbox, cell=13, seed=3):
    """Cracked-mud pattern inside bbox: returns (crack 0..1, cell_shade -1..1) full-size arrays."""
    from scipy.spatial import cKDTree
    h, w = shape
    x0, y0, x1, y1 = bbox
    rng = np.random.default_rng(seed)
    n = max(8, int((x1 - x0) * (y1 - y0) / (cell * cell)))
    pts = np.column_stack([rng.uniform(x0 - cell, x1 + cell, n), rng.uniform(y0 - cell, y1 + cell, n)])
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    # wobble the lookup so cracks are not straight Voronoi lines
    nx = cv2.GaussianBlur(rng.normal(0, 1, (y1 - y0, x1 - x0)).astype(np.float32), (0, 0), 4) * 9
    ny = cv2.GaussianBlur(rng.normal(0, 1, (y1 - y0, x1 - x0)).astype(np.float32), (0, 0), 4) * 9
    q = np.column_stack([(xx + nx).ravel(), (yy + ny).ravel()])
    d, idx = cKDTree(pts).query(q, k=2)
    gap = (d[:, 1] - d[:, 0]).reshape(y1 - y0, x1 - x0)
    crack = np.clip(1.6 - gap, 0, 1)
    shade = rng.uniform(-1, 1, n)[idx[:, 0]].reshape(y1 - y0, x1 - x0)
    C = np.zeros(shape, np.float32); Sh = np.zeros(shape, np.float32)
    C[y0:y1, x0:x1] = crack; Sh[y0:y1, x0:x1] = shade
    return C, Sh

def mud_rim(img, mask, width, seed=7, crack_cell=13):
    """Lower the water: a band ~`width` px along the shore becomes mud (dry and cracked at the old
    shore, dark and wet at the new waterline). Returns (image, remaining_water_mask)."""
    if width <= 0:
        return img, mask
    L, A, B = lab_planes(img)
    inside = (mask > 0).astype(np.uint8)
    dist = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
    rng = np.random.default_rng(seed)
    n1 = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 18)
    n2 = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 5)
    n1 /= np.abs(n1).max() + 1e-6; n2 /= np.abs(n2).max() + 1e-6
    wmap = np.maximum(width * (1 + 0.95 * n1 + 0.30 * n2), 0.5)
    alpha = np.clip((wmap - dist) / 4.0 + 0.5, 0, 1) * inside          # 1 = mud, soft 4px edge to water
    t = np.clip(dist / wmap, 0, 1)                                          # 0 old shore .. 1 new waterline
    ys, xs = np.nonzero(inside)
    bbox = (max(xs.min() - 4, 0), max(ys.min() - 4, 0), min(xs.max() + 5, L.shape[1]), min(ys.max() + 5, L.shape[0]))
    crack, shade = _cracks(L.shape, bbox, cell=crack_cell, seed=seed + 1)
    dry = np.clip(1 - t / 0.65, 0, 1)                                        # cracks only on the dry outer part
    detail = (L - cv2.GaussianBlur(L, (0, 0), 3)) * 0.25
    grain = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 0.8) * 4
    mud_L = 130 - 46 * t + shade * 5 * dry + detail + grain - crack * 38 * dry
    mud_A = 137 - 2 * t
    mud_B = 160 - 9 * t
    L2 = L + alpha * (mud_L - L); A2 = A + alpha * (mud_A - A); B2 = B + alpha * (mud_B - B)
    # wet edge: slightly darker line where mud meets the remaining water
    edge = np.clip(1 - np.abs(alpha - 0.5) * 3, 0, 1) * inside
    L2 = L2 - edge * 12
    remaining = ((inside > 0) & (alpha < 0.5)).astype(np.uint8) * 255
    return to_bgr(L2, A2, B2), remaining

def dry_channel(img, mask, s):
    """Irrigation channel dried: water becomes cracked pale mud."""
    L, A, B = lab_planes(img)
    m = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), 1.0) * s
    detail = (L - cv2.GaussianBlur(L, (0, 0), 2)) * 0.4
    L2 = L + m * (150 + detail - L)
    A2 = A + m * (138 - A)
    B2 = B + m * (158 - B)
    return to_bgr(L2, A2, B2)

def haze(img, s, color=(196, 214, 232)):
    """Dusty air: lift blacks, lower contrast and saturation, warm dusty tint (BGR color)."""
    f = img.astype(np.float32)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
    f = f * (1 - 0.25 * s) + gray * 0.25 * s
    f = f * (1 - 0.22 * s) + np.array(color, np.float32) * 0.22 * s
    return f.clip(0, 255).astype(np.uint8)
