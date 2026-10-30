"""Cut palms (with their shadows) and small shrubs out of the locked V1 picture so they can be
re-planted elsewhere in the same painting. Shadows are kept as a darkening ratio, so they
sit naturally on whatever sand they land on."""
import numpy as np, cv2

def _planes(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    non_sand = ((hsv[..., 2] < 178) | (lab[..., 1] < 138)).astype(np.uint8) * 255
    L = lab[..., 0].astype(np.float32)
    bg = cv2.medianBlur(lab[..., 0], 61).astype(np.float32)
    return non_sand, L, bg

def cut(img, body_boxes, shadow_box, anchor):
    """body_boxes: [(x0,y0,x1,y1)] where non-sand pixels are the plant; shadow_box: where the cast
    shadow lies (or None); anchor: (x, y) ground point of the trunk. Returns a sprite dict."""
    h, w = img.shape[:2]
    non_sand, L, bg = _planes(img)
    body = np.zeros((h, w), np.uint8)
    for x0, y0, x1, y1 in body_boxes:
        body[y0:y1, x0:x1] = non_sand[y0:y1, x0:x1]
    body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    ratio = np.ones((h, w), np.float32)
    if shadow_box is not None:
        x0, y0, x1, y1 = shadow_box
        r = np.clip(L / np.maximum(bg, 1), 0.45, 1.0)
        sh = np.zeros((h, w), np.float32)
        sh[y0:y1, x0:x1] = 1
        r = np.where((sh > 0) & (r < 0.9), r, 1.0)       # only the real cast shadow, not sand texture
        r = cv2.GaussianBlur(r, (0, 0), 0.8)
        ratio = np.where(sh > 0, r, 1.0).astype(np.float32)
    alpha = cv2.GaussianBlur(body.astype(np.float32) / 255.0, (0, 0), 0.9)
    ys, xs = np.nonzero((alpha > 0.02) | (ratio < 0.99))
    X0, X1, Y0, Y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    return dict(rgb=img[Y0:Y1, X0:X1].astype(np.float32), alpha=alpha[Y0:Y1, X0:X1],
                ratio=ratio[Y0:Y1, X0:X1], off=(X0 - anchor[0], Y0 - anchor[1]))

def place(img, sp, at, scale=1.0, flip=False):
    """Plant sprite `sp` with its anchor at `at`. Shadow first (multiply), then the plant."""
    rgb, alpha, ratio = sp['rgb'], sp['alpha'], sp['ratio']
    ox, oy = sp['off']
    if flip:
        rgb, alpha, ratio = rgb[:, ::-1], alpha[:, ::-1], ratio[:, ::-1]
        ox = -(ox + rgb.shape[1])
    if scale != 1.0:
        size = (max(1, int(round(rgb.shape[1] * scale))), max(1, int(round(rgb.shape[0] * scale))))
        rgb = cv2.resize(rgb, size, interpolation=cv2.INTER_AREA)
        alpha = cv2.resize(alpha, size, interpolation=cv2.INTER_AREA)
        ratio = cv2.resize(ratio, size, interpolation=cv2.INTER_AREA)
        ox, oy = ox * scale, oy * scale
    x0, y0 = int(round(at[0] + ox)), int(round(at[1] + oy))
    h, w = rgb.shape[:2]
    H, W = img.shape[:2]
    cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if cx1 <= cx0 or cy1 <= cy0:
        return img
    out = img.astype(np.float32)
    sx0, sy0 = cx0 - x0, cy0 - y0
    region = out[cy0:cy1, cx0:cx1]
    r = ratio[sy0:sy0 + (cy1 - cy0), sx0:sx0 + (cx1 - cx0)][..., None]
    a = alpha[sy0:sy0 + (cy1 - cy0), sx0:sx0 + (cx1 - cx0)][..., None]
    c = rgb[sy0:sy0 + (cy1 - cy0), sx0:sx0 + (cx1 - cx0)]
    region = region * r
    region = region * (1 - a) + c * a
    out[cy0:cy1, cx0:cx1] = region
    return out.clip(0, 255).astype(np.uint8)

def place_flowering(img, sp, at, scale=1.0, flip=False, colours=((176, 84, 226), (214, 150, 245)), dots=14, seed=0):
    """Plant a green shrub and dot it with small blossoms (BGR colours) so it reads as a flowering bush."""
    out = place(img, sp, at, scale=scale, flip=flip)
    # rebuild the placed alpha footprint
    alpha = sp['alpha']
    ox, oy = sp['off']
    if flip:
        alpha = alpha[:, ::-1]; ox = -(ox + alpha.shape[1])
    if scale != 1.0:
        alpha = cv2.resize(alpha, (max(1, int(round(alpha.shape[1] * scale))), max(1, int(round(alpha.shape[0] * scale)))), interpolation=cv2.INTER_AREA)
        ox, oy = ox * scale, oy * scale
    x0, y0 = int(round(at[0] + ox)), int(round(at[1] + oy))
    ys, xs = np.nonzero(alpha > 0.6)
    if len(xs) == 0:
        return out
    rng = np.random.default_rng(seed)
    top = ys < np.percentile(ys, 75)                  # blossoms sit on the upper, lit part of the bush
    ys, xs = ys[top], xs[top]
    layer = out.copy()
    for i in rng.choice(len(xs), size=min(dots, len(xs)), replace=False):
        cx, cy = x0 + xs[i], y0 + ys[i]
        col = colours[int(rng.integers(len(colours)))]
        cv2.circle(layer, (int(cx), int(cy)), 1, tuple(int(v * 0.72) for v in col), -1, cv2.LINE_AA)
        cv2.circle(layer, (int(cx), int(cy) - 1), 1, col, -1, cv2.LINE_AA)
    return cv2.addWeighted(layer, 0.9, out, 0.1, 0)
