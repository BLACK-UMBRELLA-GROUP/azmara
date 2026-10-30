"""Background homes ladder: wooden (Level 1) -> mud-brick (as painted) -> whitewashed -> finest.
Each home is outlined by hand as roof + wall faces (master pixel coordinates). Only those
outlines change; doors and windows (dark openings) are kept."""
import numpy as np, cv2
from worse_lib import lab_planes, to_bgr

HOMES = {
    'L1': dict(roof=[(169, 199), (204, 189), (244, 200), (201, 209)],
               walls=[[(169, 199), (201, 209), (201, 248), (165, 239)],
                      [(201, 209), (244, 200), (247, 237), (201, 248)]], flat=True),
    'R4': dict(roof=[(1300, 195), (1337, 183), (1381, 197), (1350, 206)],
               walls=[[(1300, 195), (1350, 206), (1350, 246), (1299, 237)],
                      [(1350, 206), (1381, 197), (1382, 233), (1350, 246)]], flat=True),
    'L3': dict(roof=[(71, 289), (101, 279), (127, 289), (100, 296)],
               walls=[[(71, 289), (100, 296), (100, 334), (69, 325)],
                      [(100, 296), (126, 289), (126, 318), (100, 333)]], flat=True),
    'L2': dict(roof=None,
               walls=[[(313, 239), (337, 244), (337, 262), (313, 257)],
                      [(337, 236), (388, 228), (388, 252), (337, 262)]], flat=False),
    'R1': dict(roof=None,
               walls=[[(1126, 236), (1152, 241), (1152, 267), (1126, 260)],
                      [(1152, 238), (1186, 233), (1186, 262), (1152, 267)]], flat=False),
}

def _poly(shape, pts):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 255)
    return m

def masks(shape):
    """Per home: (roof mask or None, list of wall-face masks)."""
    out = {}
    for k, hdef in HOMES.items():
        roof = _poly(shape, hdef['roof']) if hdef['roof'] else None
        out[k] = (roof, [_poly(shape, f) for f in hdef['walls']])
    return out

def _openings(L, m):
    """Dark door/window openings inside a face (kept as they are). Only solid dark areas count;
    small dark specks (dirt, shading at the wall foot) are repainted with the wall."""
    dark = ((L < 75) & (m > 0)).astype(np.uint8)
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    keep = np.zeros_like(dark)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if area >= 10 and h >= 4 and area / float(w * h) > 0.45:
            keep[lab == i] = 1
    return keep

def wood(img, homes=None, seed=4):
    """Rough timber shacks: vertical boards on the walls, reed-mat roofs on the flat roofs."""
    L, A, B = lab_planes(img)
    NL, NA, NB = L.copy(), A.copy(), B.copy()
    rng = np.random.default_rng(seed)
    M = masks(L.shape)
    xx = np.arange(L.shape[1], dtype=np.float32)[None, :].repeat(L.shape[0], 0)
    yy = np.arange(L.shape[0], dtype=np.float32)[:, None].repeat(L.shape[1], 1)
    for k, (roof, faces) in M.items():
        if homes is not None and k not in homes:
            continue
        for fi, f in enumerate(faces):
            sel = f > 0
            op = _openings(L, f) > 0
            mean = np.median(L[sel & ~op])
            shade = np.clip(L / max(mean, 1), 0.55, 1.25)
            board_w = 3.4
            idx = np.floor((xx + rng.uniform(0, board_w)) / board_w).astype(int)
            tone = rng.normal(0, 7, idx.max() + 2)[idx]
            gap = (np.abs(((xx + 0.5) % board_w) - 0.5) < 0.55).astype(np.float32)
            base = (112 if fi == 1 else 96) + tone - gap * 26
            sel2 = sel & ~op
            NL[sel2] = (base * shade)[sel2]
            NA[sel2] = 141.5
            NB[sel2] = 154 + tone[sel2] * 0.3
        if roof is not None:
            sel = roof > 0
            mean = np.median(L[sel])
            shade = np.clip(L / max(mean, 1), 0.6, 1.25)
            weave = (np.sin((xx * 0.9 + yy * 1.6)) * 0.5 + 0.5) * 10 + (np.sin((xx * 0.9 - yy * 1.6) * 0.5) * 0.5 + 0.5) * 6
            grain = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 0.7) * 5
            base = 104 + weave + grain
            NL[sel] = (base * shade)[sel]
            NA[sel] = 139
            NB[sel] = 152
    return _blend(img, L, A, B, NL, NA, NB, M, homes)

def whitewash(img, homes=None, strength=1.0):
    """Lime-washed walls and roofs: warm off-white, keeping the painted texture and shading."""
    L, A, B = lab_planes(img)
    NL, NA, NB = L.copy(), A.copy(), B.copy()
    M = masks(L.shape)
    detail = L - cv2.GaussianBlur(L, (0, 0), 1.5)
    for k, (roof, faces) in M.items():
        if homes is not None and k not in homes:
            continue
        for f in faces + ([roof] if roof is not None else []):
            sel = f > 0
            op = _openings(L, f) > 0
            low = cv2.GaussianBlur(L, (0, 0), 1.5)
            mean = np.median(low[sel & ~op])
            shade = np.clip(low / max(mean, 1), 0.6, 1.2) ** 0.8
            s2 = sel & ~op
            NL[s2] = np.clip(202 * shade + detail * 0.7, 0, 240)[s2]
            NA[s2] = 132
            NB[s2] = 146
    out_L, out_A, out_B = L + strength * (NL - L), A + strength * (NA - A), B + strength * (NB - B)
    return _blend(img, L, A, B, out_L, out_A, out_B, M, homes)

def _blend(img, L, A, B, NL, NA, NB, M, homes):
    m = np.zeros(L.shape, np.float32)
    for k, (roof, faces) in M.items():
        if homes is not None and k not in homes:
            continue
        for f in faces + ([roof] if roof is not None else []):
            m = np.maximum(m, (f > 0).astype(np.float32))
    m = cv2.erode(m, np.ones((2, 2), np.uint8))
    a = cv2.GaussianBlur(m, (0, 0), 0.9)[..., None]
    new = to_bgr(NL, NA, NB).astype(np.float32)
    # composite in BGR so every pixel outside the homes stays exactly as it was
    out = img.astype(np.float32) * (1 - a) + new * a
    return np.where(a > 0.002, out.round(), img.astype(np.float32)).astype(np.uint8)
