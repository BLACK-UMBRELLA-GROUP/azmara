"""Edits for the richer land stages (Town Hall 28-50), all made on the locked V1 picture."""
import numpy as np, cv2
from scipy.spatial import cKDTree
from worse_lib import lab_planes, to_bgr

def pave(img, mask, spacing=11.0, squash=0.62, seed=5):
    """Lay flagstones like the plaza's inside `mask`, keeping the picture's own light and shadows.
    Edge stones are dropped at random so the border breaks up into sand naturally."""
    L, A, B = lab_planes(img)
    ys, xs = np.nonzero(mask > 0)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    rng = np.random.default_rng(seed)
    gx = np.arange(x0 - spacing, x1 + spacing, spacing)
    gy = np.arange(y0 - spacing, y1 + spacing, spacing * squash)
    P = np.array([(x + (i % 2) * spacing / 2, y) for i, y in enumerate(gy) for x in gx], np.float32)
    P += rng.uniform(-0.28, 0.28, P.shape) * np.array([spacing, spacing * squash])
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    tree = cKDTree(np.column_stack([P[:, 0], P[:, 1] / squash]))
    d, idx = tree.query(np.column_stack([xx.ravel(), yy.ravel() / squash]), k=2)
    gap = (d[:, 1] - d[:, 0]).reshape(xx.shape)
    near = idx[:, 0].reshape(xx.shape)
    mortar = np.clip(1.7 - gap, 0, 1)
    rim = np.clip(1 - gap / 3.5, 0, 1)
    n = len(P)
    baseL, baseA, baseB = rng.normal(188, 10, n), rng.normal(140.5, 1.2, n), rng.normal(168, 3, n)
    dx = (xx - P[near, 0]) / spacing; dy = (yy - P[near, 1]) / (spacing * squash)
    grain = cv2.GaussianBlur(rng.normal(0, 1, xx.shape).astype(np.float32), (0, 0), 0.6) * 4
    stoneL = baseL[near] - (dx * 7 + dy * 10) - rim * 10 + grain
    sL = stoneL * (1 - mortar) + (stoneL - 62) * mortar
    sA = baseA[near] * (1 - mortar) + 138.5 * mortar
    sB = baseB[near] * (1 - mortar) + 156 * mortar
    # stones whose centre falls outside the (slightly shrunk) mask are left out -> ragged edge
    inner = cv2.erode((mask > 0).astype(np.uint8), np.ones((5, 5), np.uint8))
    cxi = np.clip(P[:, 0].round().astype(int), 0, L.shape[1] - 1)
    cyi = np.clip(P[:, 1].round().astype(int), 0, L.shape[0] - 1)
    keep_stone = (inner[cyi, cxi] > 0) | ((mask[cyi, cxi] > 0) & (rng.random(n) < 0.55))
    sub = (mask[y0:y1, x0:x1] > 0) & keep_stone[near]
    m = np.zeros(L.shape, np.float32)
    m[y0:y1, x0:x1] = sub.astype(np.float32)
    ref = np.median(L[mask > 0])
    light = np.clip(cv2.GaussianBlur(L, (0, 0), 3)[y0:y1, x0:x1] / ref, 0.55, 1.12)
    NL, NA, NB = L.copy(), A.copy(), B.copy()
    NL[y0:y1, x0:x1] = sL * light
    NA[y0:y1, x0:x1] = sA
    NB[y0:y1, x0:x1] = sB
    alpha = cv2.GaussianBlur(m, (0, 0), 0.7)
    return to_bgr(L + alpha * (NL - L), A + alpha * (NA - A), B + alpha * (NB - B))

def lush(img, s, region=None, water=None):
    """Opposite of drying: greener, richer plants (s 0..1). Optional `water` mask gets clearer."""
    L, A, B = lab_planes(img)
    w = np.clip((136.0 - A) / 8.0, 0, 1) * np.clip((B - 135.0) / 6.0, 0, 1)
    if region is not None:
        w *= cv2.GaussianBlur((region > 0).astype(np.float32), (0, 0), 12)
    if water is not None:
        w *= 1 - (water > 0)
    w = cv2.GaussianBlur(w, (0, 0), 0.8) * s
    A2 = A - w * 7.0
    B2 = B + w * (B - 128) * 0.12
    L2 = L + w * np.clip((L - 60) * 0.06, -4, 8)
    out = to_bgr(L2, A2, B2)
    if water is not None:
        L, A, B = lab_planes(out)
        m = cv2.GaussianBlur((water > 0).astype(np.float32), (0, 0), 1.2) * s
        out = to_bgr(L + m * 9, A - m * 5, B - m * 9)
    return out

def golden(img, s):
    """Warm late-afternoon finish: a touch more contrast, warmth in the highlights."""
    L, A, B = lab_planes(img)
    mid = 128
    L2 = mid + (L - mid) * (1 + 0.08 * s)
    hl = np.clip((L - 120) / 120, 0, 1)
    B2 = B + s * 5 * hl
    A2 = A + s * 1.5 * hl
    chroma = 1 + 0.07 * s
    return to_bgr(L2, 128 + (A2 - 128) * chroma, 128 + (B2 - 128) * chroma)

def kerb(img, pool, width=5, block=8.0, seed=12):
    """A continuous edge of stone blocks along the inside of the pool outline (like the plaza
    stones), lit from the top, with a soft shadow on the water side."""
    from scipy.spatial import cKDTree
    L, A, B = lab_planes(img)
    h, w = pool.shape
    cnts, _ = cv2.findContours(pool, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=len)[:, 0, :].astype(np.float32)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]
    dist = cv2.distanceTransform((pool > 0).astype(np.uint8), cv2.DIST_L2, 5)
    band = (pool > 0) & (dist <= width)
    ys, xs = np.nonzero(band)
    _, idx = cKDTree(c).query(np.column_stack([xs, ys]))
    arc = seg[idx]
    rng = np.random.default_rng(seed)
    n_blocks = int(seg[-1] / block) + 2
    bl = rng.uniform(0.85, 1.15, n_blocks)            # uneven block lengths
    edges = np.r_[0, np.cumsum(bl * block)]
    k = np.searchsorted(edges, arc, side='right') - 1
    frac = (arc - edges[k]) / (bl[k] * block)
    gap = (frac < 0.10) | (frac > 0.94)
    d = dist[ys, xs] / width                          # 0 at the outer edge, 1 at the water side
    tone = rng.normal(0, 7, n_blocks)[k]
    stoneL = 192 + tone + 10 * (1 - d) - 22 * d ** 2
    stoneL = np.where(gap, stoneL - 48, stoneL)
    NL, NA, NB = L.copy(), A.copy(), B.copy()
    NL[ys, xs] = stoneL
    NA[ys, xs] = 139.5 + rng.normal(0, 0.8, n_blocks)[k]
    NB[ys, xs] = 161 + rng.normal(0, 2.0, n_blocks)[k]
    m = np.zeros((h, w), np.float32); m[ys, xs] = 1
    a = cv2.GaussianBlur(m, (0, 0), 0.6)
    L2, A2, B2 = L + a * (NL - L), A + a * (NA - A), B + a * (NB - B)
    inner = ((pool > 0) & (dist > width)).astype(np.uint8) * 255
    shadow = np.clip(1 - (dist - width) / 5, 0, 1) * (inner > 0)
    L2 = L2 - cv2.GaussianBlur(shadow.astype(np.float32), (0, 0), 1.2) * 20
    return to_bgr(L2, A2, B2), inner

def clear_water(img, water, s, hue=1.0):
    """Clean, clear water: lighter and shifted from swamp green towards turquoise (s 0..1)."""
    L, A, B = lab_planes(img)
    m = cv2.GaussianBlur((water > 0).astype(np.float32), (0, 0), 1.5) * s
    detail = L - cv2.GaussianBlur(L, (0, 0), 2.5)
    return to_bgr(L + m * (9 + detail * 0.3), A - m * 6 * hue, B - m * 16 * hue)

def fresh_reeds(img, region, s):
    """Dry yellow reeds and grasses inside `region` turn fresh green (no sand: needs texture)."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, Sat, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    texture = cv2.GaussianBlur(np.abs(L - cv2.GaussianBlur(L, (0, 0), 2)), (0, 0), 2)
    yellow = np.clip((H - 16) / 4, 0, 1) * np.clip((34 - H) / 4, 0, 1) * np.clip((Sat - 110) / 30, 0, 1) * np.clip((texture - 5) / 5, 0, 1)
    w = yellow * cv2.GaussianBlur((region > 0).astype(np.float32), (0, 0), 6) * s
    w = cv2.GaussianBlur(w, (0, 0), 0.8)
    hsv[..., 0] = H + w * 9
    hsv[..., 2] = V * (1 - w * 0.08)
    return cv2.cvtColor(hsv.clip(0, [179, 255, 255]).astype(np.uint8), cv2.COLOR_HSV2BGR)
