"""Shared LaMa helper: inpaint masked pixels and paste back with a soft edge (only masked areas change)."""
import numpy as np, cv2, torch
_model = {}
def inpaint(img_bgr, mask, model_path, feather=2.0, ctx_mask=None):
    """mask: uint8 0/255 area to replace. ctx_mask: optional larger area hidden from the model
    (e.g. a neighbour we don't want copied). Only `mask` is pasted back."""
    if model_path not in _model:
        _model[model_path] = torch.jit.load(model_path, map_location='cpu').eval()
    m = _model[model_path]
    h, w = mask.shape
    hide = mask if ctx_mask is None else cv2.bitwise_or(mask, ctx_mask)
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    ph, pw = (8 - h % 8) % 8, (8 - w % 8) % 8
    t_img = torch.from_numpy(np.pad(rgb, ((0, ph), (0, pw), (0, 0)), mode='symmetric')).permute(2, 0, 1).float()[None] / 255.0
    t_mask = (torch.from_numpy(np.pad(hide, ((0, ph), (0, pw)), mode='symmetric')).float()[None, None] / 255.0 > 0.5).float()
    with torch.no_grad():
        out = m(t_img, t_mask)
    res = cv2.cvtColor((out[0].permute(1, 2, 0).numpy() * 255).clip(0, 255).astype(np.uint8)[:h, :w], cv2.COLOR_RGB2BGR)
    soft = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), feather)[..., None]
    return (img_bgr.astype(np.float32) * (1 - soft) + res.astype(np.float32) * soft).round().astype(np.uint8)
