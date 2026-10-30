"""Build the 5 'how bad can Level 1 look' options from the edited bases.
Usage: python3 -I build_options.py <worse_dir>"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import numpy as np, cv2
from worse_lib import water_masks, veg_weight, dry_plants, murky_water, mud_rim, dry_channel, haze, lab_planes, to_bgr
D = pathlib.Path(sys.argv[1])

def wheat_mask(img):
    L, A, B = lab_planes(img)
    S = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[..., 1].astype(np.float32)
    m = ((A > 138) & (B > 168) & (S > 150)).astype(np.uint8) * 255
    reg = np.zeros_like(m); cv2.rectangle(reg, (40, 765), (385, 965), 255, -1)
    m &= reg
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    return m

def wither_wheat(img, mask, s):
    """Wheat goes pale and patchy (s 0..1), then grey-brown stubble at the top end."""
    L, A, B = lab_planes(img)
    m = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), 1.0) * s
    rng = np.random.default_rng(11)
    patches = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 9)
    patches = np.clip(patches / (np.abs(patches).max() + 1e-6) * 2.2, 0, 1)   # bare patches
    L2 = L - m * (L * 0.10 + patches * 22 * s)
    A2 = A + m * (136 - A) * 0.8
    B2 = B + m * (152 - B) * 0.85
    return to_bgr(L2, A2, B2)

def option(base, plants, brown, murk, rim, chan, wheat, hz, seed=7):
    img = base.copy()
    pond, chans, casc = water_masks(img)
    wv = veg_weight(img, exclude=pond | chans)
    if plants > 0:
        img = dry_plants(img, plants, weight=wv, brown=brown)
    if wheat > 0:
        img = wither_wheat(img, wheat_mask(img), wheat)
    if murk > 0:
        img = murky_water(img, pond, murk)
    if rim > 0:
        img, _ = mud_rim(img, pond, rim, seed=seed)
    if chan > 0:
        img = dry_channel(img, chans, chan)
    if hz > 0:
        img = haze(img, hz)
    return img

road = cv2.imread(str(D / 'step_road.png'))
b4 = cv2.imread(str(D / 'base_opt4.png'))
b5 = cv2.imread(str(D / 'base_opt5.png'))
OPTS = {
    1: (road, dict(plants=0.0, brown=0.0, murk=0.0, rim=0, chan=0.0, wheat=0.0, hz=0.0)),
    2: (road, dict(plants=0.55, brown=0.0, murk=0.3, rim=0, chan=0.0, wheat=0.25, hz=0.0)),
    3: (road, dict(plants=0.85, brown=0.1, murk=0.6, rim=12, chan=0.5, wheat=0.5, hz=0.1)),
    4: (b4, dict(plants=1.0, brown=0.4, murk=0.85, rim=24, chan=1.0, wheat=0.75, hz=0.2)),
    5: (b5, dict(plants=1.0, brown=0.8, murk=1.0, rim=42, chan=1.0, wheat=1.0, hz=0.4)),
}
for k, (base, kw) in OPTS.items():
    out = option(base, **kw)
    cv2.imwrite(str(D / f'option_{k}.png'), out)
    print('option', k, 'done')
