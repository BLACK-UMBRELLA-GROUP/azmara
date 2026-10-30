"""Build the 11 land stages (one per Town Hall look) from the locked pictures.
Stages 1-3 reuse the 'worse' bases with their grading; 4-6 are the existing greener pictures;
7-11 are new additions on the full green picture (V1). Homes: wooden -> mud-brick -> whitewashed."""
import sys, pathlib, pickle
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import numpy as np, cv2
from worse_lib import water_masks, veg_weight, dry_plants, murky_water, mud_rim, dry_channel, haze, lab_planes, to_bgr
from homes import wood, whitewash
from sprites import place, place_flowering
from growth_lib import pave, lush, golden, kerb, clear_water, fresh_reeds

S = pathlib.Path(sys.argv[1])
A = S.parent.parent / 'docs' / 'approved' / 'art' / 'ARCHIVE'  # locked masters V1 and V2
OUT = S / 'land' / 'stages'  # generated output, gitignored
OUT.mkdir(parents=True, exist_ok=True)
rd = lambda p: cv2.imread(str(S / p))

def wheat_mask(img):
    L, A, B = lab_planes(img)
    Sat = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[..., 1].astype(np.float32)
    m = ((A > 138) & (B > 168) & (Sat > 150)).astype(np.uint8) * 255
    reg = np.zeros_like(m); cv2.rectangle(reg, (40, 765), (385, 965), 255, -1)
    return cv2.morphologyEx(m & reg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))

def wither_wheat(img, mask, s):
    L, A, B = lab_planes(img)
    m = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), 1.0) * s
    rng = np.random.default_rng(11)
    patches = cv2.GaussianBlur(rng.normal(0, 1, L.shape).astype(np.float32), (0, 0), 9)
    patches = np.clip(patches / (np.abs(patches).max() + 1e-6) * 2.2, 0, 1)
    return to_bgr(L - m * (L * 0.10 + patches * 22 * s), A + m * (136 - A) * 0.8, B + m * (152 - B) * 0.85)

def grade(base, plants, brown, murk, rim, chan, wheat, hz, seed=7):
    """Same grading as the five 'worse' options (identical maths and seeds)."""
    img = base.copy()
    pond, chans, casc = water_masks(img)
    wv = veg_weight(img, exclude=pond | chans)
    if plants > 0: img = dry_plants(img, plants, weight=wv, brown=brown)
    if wheat > 0: img = wither_wheat(img, wheat_mask(img), wheat)
    if murk > 0: img = murky_water(img, pond, murk)
    if rim > 0: img, _ = mud_rim(img, pond, rim, seed=seed)
    if chan > 0: img = dry_channel(img, chans, chan)
    if hz > 0: img = haze(img, hz)
    return img

ALL = ['L1', 'L2', 'L3', 'R1', 'R4']
v1 = cv2.imread(str(A / 'TOWN_MASTER_2026-10-17_V1.png'))
road = rd('worse/step_road.png')
b4 = rd('worse/base_opt4.png')
five = rd('masters/drafts/TOWN_MASTER_draft_5-palm-oasis.png')
palms = pickle.load(open(S / 'land/palm_sprites.pkl', 'rb'))
shrubs = pickle.load(open(S / 'land/shrub_sprites.pkl', 'rb'))
water_v1 = cv2.imread(str(S / 'land/mask_water_v1.png'), 0)
oasis = np.zeros(v1.shape[:2], np.uint8); cv2.rectangle(oasis, (0, 560), (1536, 1024), 255, -1)
town = np.full(v1.shape[:2], 255, np.uint8)
avenue = cv2.imread(str(S / 'land/mask_avenue.png'), 0)

def wood_except(img, upgraded):
    return wood(img, homes=[h for h in ALL if h not in upgraded])

stages = {}
# 1-3: struggling land, homes go from all wooden to mostly mud-brick
locked = cv2.imread(str(A / 'TOWN_MASTER_2026-10-17_V2.png'))
graded1 = grade(wood_except(b4, []), 1.0, 0.4, 0.85, 24, 1.0, 0.75, 0.2)
from homes import masks as home_masks
hm = np.zeros(v1.shape[:2], np.uint8)
for roof, faces in home_masks(hm.shape).values():
    for f in faces + ([roof] if roof is not None else []):
        hm |= f
hm = cv2.dilate(hm, np.ones((5, 5), np.uint8))
fa = cv2.GaussianBlur((hm > 0).astype(np.float32), (0, 0), 1.0)[..., None]
s1 = locked.astype(np.float32) * (1 - fa) + graded1.astype(np.float32) * fa
stages[1] = np.where(fa > 0.002, s1.round(), locked.astype(np.float32)).astype(np.uint8)   # locked picture + wooden homes only
stages[2] = grade(wood_except(road, ['L1']), 0.85, 0.1, 0.6, 12, 0.5, 0.5, 0.1)
stages[3] = grade(wood_except(road, ['L1', 'L2', 'R4']), 0.55, 0.0, 0.3, 0, 0.0, 0.25, 0.0)
# 4-6: the oasis gets clearly better each step (greener, clearer water); homes all mud-brick
stages[4] = lush(road, 0.35, region=oasis, water=water_v1)
# Town Hall 17: two of the removed oasis palms (right side) grow back -> 7 palms, then 9 at Town Hall 22
pm = cv2.imread(str(S / 'edit_out_v2/mask_all.png'), 0)
right = np.zeros_like(pm); right[540:815, 950:1190] = 255
pm = cv2.dilate(pm & right, np.ones((5, 5), np.uint8))
pa = cv2.GaussianBlur((pm > 0).astype(np.float32), (0, 0), 2.0)[..., None]
seven = (five.astype(np.float32) * (1 - pa) + v1.astype(np.float32) * pa).round().astype(np.uint8)
stages[5] = lush(seven, 0.55, region=oasis, water=water_v1)
# From Town Hall 22 the swamp clears: lily pads and reed clumps in the water are gone (deswamp step A)
clean = rd('deswamp/v1_A2.png')
pool = cv2.imread(str(S / 'deswamp/pool_smooth.png'), 0)
pc, cc, kc = water_masks(clean)
water_c = pc | cc | kc | pool
reeds_area = np.zeros(v1.shape[:2], np.uint8); cv2.rectangle(reeds_area, (470, 570), (1110, 1024), 255, -1)
water_tint = pc & cv2.dilate(pool, np.ones((7, 7), np.uint8))     # real water pixels only, so plants at the edge keep their colour
stages[6] = lush(clean, 0.75, region=oasis, water=water_c)

def grove(img):
    for key, at, sc in [('R1', (492, 214), 0.97), ('R2', (612, 209), 1.0), ('R2', (930, 210), 0.98), ('R1', (1050, 214), 0.96)]:
        img = place(img, palms[key], at, scale=sc)
    return img

def hedges(img):
    order = ['S1', 'S2', 'S3']
    rng = np.random.default_rng(9)
    for i, y in enumerate([150, 172, 236, 258, 322, 344, 366]):
        img = place(img, shrubs[order[i % 3]], (737 + int(rng.integers(-1, 2)), y), scale=float(rng.uniform(0.78, 0.9)))
        img = place(img, shrubs[order[(i + 1) % 3]], (812 + int(rng.integers(-1, 2)), y + 4), scale=float(rng.uniform(0.78, 0.9)))
    return img

def home_gardens(img):
    spots = [((161, 246), 'S1'), ((250, 240), 'S3'), ((1296, 242), 'S2'), ((1386, 237), 'S1'),
             ((298, 262), 'S3'), ((394, 256), 'S2'), ((64, 331), 'S2'), ((1122, 266), 'S1'), ((1191, 265), 'S3')]
    for at, key in spots:
        img = place(img, shrubs[key], at, scale=0.8)
    return img

def flowers(img):
    white_pink = ((235, 235, 245), (176, 84, 226), (214, 150, 245))
    for j, (at, sc) in enumerate([((728, 392), 0.85), ((826, 397), 0.85), ((585, 470), 0.95), ((952, 470), 0.95)]):
        img = place_flowering(img, shrubs[['S1', 'S2', 'S3'][j % 3]], at, scale=sc, flip=bool(j % 2), colours=white_pink, dots=16, seed=50 + j)
    return img

def pool_flowers(img):
    """Flowering bushes on the outside of the pool's stone edge, spaced along it."""
    cnts, _ = cv2.findContours(pool, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=len)[:, 0, :].astype(np.float32)
    arc = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]
    cx, cy = c[:, 0].mean(), c[:, 1].mean()
    picks, last = [], -1e9
    for i in range(len(c)):
        if arc[i] - last >= 58:
            x, y = c[i]
            if 735 <= x <= 805 and y < 730:      # keep the waterfall clear
                continue
            if y > 990:
                continue
            nx, ny = x - cx, y - cy
            nrm = max(np.hypot(nx, ny), 1)
            picks.append((x + nx / nrm * 9, y + ny / nrm * 9 + 6)); last = arc[i]
    keys = ['S1', 'S2', 'S3']
    for j, at in enumerate(picks):
        img = place_flowering(img, shrubs[keys[j % 3]], at, scale=0.62 + 0.06 * (j % 2), flip=bool(j % 2), dots=12, seed=j)
    return img

def rich(k):
    img = clean.copy()
    img = grove(img)
    img = fresh_reeds(img, reeds_area, 1.0)                     # Town Hall 28+: no more dry marsh reeds
    if k >= 8: img = pave(img, avenue)
    white = {7: ['L1', 'R4'], 8: ['L1', 'R4', 'L2'], 9: ALL, 10: ALL, 11: ALL}[k]
    img = whitewash(img, homes=white)
    if k >= 10: img = home_gardens(img)
    img = lush(img, {7: 0.8, 8: 0.85, 9: 0.9, 10: 1.0, 11: 1.0}[k], region=oasis, water=water_c)
    if k >= 9: img = lush(img, {9: 0.45, 10: 0.5, 11: 0.55}[k], region=town)
    # water gets clearer step by step (no stone edge: Owner removed it 17 Oct)
    img = clear_water(img, water_tint, {7: 0.3, 8: 0.55, 9: 1.0, 10: 1.0, 11: 1.0}[k])
    if k >= 10: img = pool_flowers(img)
    if k >= 11: img = flowers(img)
    if k >= 11: img = golden(img, 1.0)
    return img

for k in range(7, 12):
    stages[k] = rich(k)
for k, im in stages.items():
    cv2.imwrite(str(OUT / f'stage_{k:02d}.png'), im)
    print('stage', k, 'saved')
