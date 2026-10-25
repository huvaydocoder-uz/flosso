"""Remove the green brick wall from the catalog compositions, keeping foam decor and the window.

Usage: python -I scripts/key_compositions.py <project_root>
Writes public/images/compositions/composition-<n>-cut.webp (RGBA) + reports the bbox in % of the source.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = sys.argv[1]
DIR = os.path.join(ROOT, "public", "images", "compositions")
meta = {}
for n in range(1, 5):
    src = Image.open(os.path.join(DIR, f"composition-{n}.webp")).convert("RGB")
    a = np.asarray(src, dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    chroma = g - (r + b) / 2
    # wall is green (and darker green in shadow); foam is neutral, window is dark neutral/brown
    alpha = np.clip((12 - chroma) / 8, 0, 1)
    # red-brown paving strip along the bottom
    h, w = alpha.shape
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    paving = (alpha > 0.5) & (lum < 120)
    rows = np.where(paving.mean(axis=1) > 0.6)[0]
    rows = rows[rows > h * 0.85]
    ground = int(rows.min()) if len(rows) else h
    alpha[ground:, :] = 0
    grey = (r + b) / 2
    g2 = np.minimum(g, grey + 3)
    rgba = np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    # drop isolated speckles from brick mortar: alpha must survive a small median
    from PIL import ImageFilter
    am = img.getchannel("A").filter(ImageFilter.MedianFilter(5))
    img.putalpha(am)
    bbox = am.point(lambda v: 255 if v > 60 else 0).getbbox()
    img = img.crop(bbox)
    img.save(os.path.join(DIR, f"composition-{n}-cut.webp"), "WEBP", quality=88, method=6)
    meta[n] = {"bbox_pct": [round(bbox[0] / w * 100, 3), round(bbox[1] / h * 100, 3), round(bbox[2] / w * 100, 3), round(bbox[3] / h * 100, 3)],
               "size": img.size}
json.dump(meta, open(os.path.join(ROOT, "data", "generated", "composition-cuts.json"), "w"), indent=1)
print(meta)
