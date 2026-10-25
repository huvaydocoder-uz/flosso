"""Extract product photos, profile sections, logo and compositions from the FLOSSO catalog PDF.

Usage: python -I scripts/extract_catalog.py flosso-katalog.pdf <project_root>
Outputs:
  public/images/products/<slug>.webp   product cut-outs (green background removed)
  public/images/compositions/<n>.webp  ready-made compositions
  data/generated/profiles.json         profile cross-section SVG paths per code
  data/generated/compositions.json     hotspot anchors per composition (% of image)
  data/generated/logo.json             logo mark + wordmark paths
"""
import json
import os
import re
import sys

import numpy as np
import pymupdf
from PIL import Image

PDF, ROOT = sys.argv[1], sys.argv[2]
OUT_IMG = os.path.join(ROOT, "public", "images", "products")
OUT_COMP = os.path.join(ROOT, "public", "images", "compositions")
OUT_DATA = os.path.join(ROOT, "data", "generated")
for d in (OUT_IMG, OUT_COMP, OUT_DATA):
    os.makedirs(d, exist_ok=True)

CODE_RE = re.compile(r"^F[A-Z]{2}\d{0,2}(\([PT]\))?\d{2}-\d{3}(\(\d+\))?$", re.I)
PROFILE_BOX = (0.9015, 0.905, 0.9086)
ZOOM = 3.2


def norm_code(t):
    return re.sub(r"\s+", "", t).upper()


def slug(code):
    return code.lower().replace("(", "").replace(")", "")


def path_d(items, ox, oy, scale=1.0):
    parts = []
    last = None

    def pt(p):
        return f"{(p.x - ox) * scale:.2f} {(p.y - oy) * scale:.2f}"

    for it in items:
        op = it[0]
        if op == "l":
            a, b = it[1], it[2]
            if last is None or abs(last.x - a.x) > 0.01 or abs(last.y - a.y) > 0.01:
                parts.append("M" + pt(a))
            parts.append("L" + pt(b))
            last = b
        elif op == "c":
            a, c1, c2, b = it[1], it[2], it[3], it[4]
            if last is None or abs(last.x - a.x) > 0.01 or abs(last.y - a.y) > 0.01:
                parts.append("M" + pt(a))
            parts.append(f"C{pt(c1)} {pt(c2)} {pt(b)}")
            last = b
        elif op == "re":
            r = it[1]
            parts.append(f"M{pt(r.tl)}L{pt(r.tr)}L{pt(r.br)}L{pt(r.bl)}Z")
            last = None
        elif op == "qu":
            q = it[1]
            parts.append(f"M{pt(q.ul)}L{pt(q.ur)}L{pt(q.lr)}L{pt(q.ll)}Z")
            last = None
    return "".join(parts)


def cutout(pix_rgb, mask_rects, radius_px):
    """Remove green background; keep neutral (white/grey) foam."""
    a = np.asarray(pix_rgb, dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    chroma = g - (r + b) / 2
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    alpha_c = np.clip((14 - chroma) / 9, 0, 1)
    alpha_l = np.clip((lum - 95) / 45, 0, 1)
    alpha = np.minimum(alpha_c, alpha_l)
    h, w = alpha.shape
    # rounded corners of the card
    yy, xx = np.mgrid[0:h, 0:w]
    for cx, cy in ((radius_px, radius_px), (w - radius_px, radius_px), (radius_px, h - radius_px), (w - radius_px, h - radius_px)):
        inx = (xx < radius_px) if cx == radius_px else (xx > w - radius_px)
        iny = (yy < radius_px) if cy == radius_px else (yy > h - radius_px)
        out = inx & iny & (((xx - cx) ** 2 + (yy - cy) ** 2) > (radius_px - 10) ** 2)
        alpha[out] = 0
    edge = 4
    alpha[:edge, :] = 0; alpha[-edge:, :] = 0; alpha[:, :edge] = 0; alpha[:, -edge:] = 0
    for (x0, y0, x1, y1) in mask_rects:
        alpha[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = 0
    # despill + neutralise to the foam's grey
    grey = (r + b) / 2
    g2 = np.minimum(g, grey + 2)
    rgb = np.stack([r, g2, b], -1)
    # tiny components / noise
    alpha[alpha < 0.08] = 0
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    if bbox:
        pad = 6
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad))
        img = img.crop(bbox)
    return img


def rect_dist(a, b):
    dx = max(b.x0 - a.x1, a.x0 - b.x1, 0)
    dy = max(b.y0 - a.y1, a.y0 - b.y1, 0)
    return (dx * dx + dy * dy) ** 0.5


doc = pymupdf.open(PDF)
profiles, report = {}, []

for pno in range(3, 20):
    page = doc[pno - 1]
    # cards = clusters of touching image rects
    rects = [pymupdf.Rect(i["bbox"]) for i in page.get_image_info()]
    clusters = []
    for r in rects:
        for c in clusters:
            if rect_dist(c, r) < 6:
                c |= r
                break
        else:
            clusters.append(pymupdf.Rect(r))
    merged = True
    while merged:
        merged = False
        for i in range(len(clusters)):
            for j in range(i + 1, len(clusters)):
                if rect_dist(clusters[i], clusters[j]) < 6:
                    clusters[i] |= clusters.pop(j)
                    merged = True
                    break
            if merged:
                break

    drawings = page.get_drawings()
    boxes = [pymupdf.Rect(d["rect"]) for d in drawings if d.get("fill") and all(abs(a - b) < 0.01 for a, b in zip(d["fill"], PROFILE_BOX))]
    # profile outline = multi-segment stroke inside a grey profile box
    outlines = [d for d in drawings if d.get("color") and not d.get("fill") and len(d["items"]) >= 4
                and any(pymupdf.Rect(d["rect"]) in (bx + (-2, -2, 2, 2)) for bx in boxes)]

    labels = []
    for blk in page.get_text("dict")["blocks"]:
        for ln in blk.get("lines", []):
            t = norm_code("".join(s["text"] for s in ln["spans"]))
            if CODE_RE.match(t):
                labels.append((t, pymupdf.Rect(ln["bbox"])))

    # render a copy with labels + profile boxes removed so they don't land in the photo
    tmp = pymupdf.open()
    tmp.insert_pdf(doc, from_page=pno - 1, to_page=pno - 1)
    tp = tmp[0]
    for bx in boxes:
        tp.add_redact_annot(bx)
    tp.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED, text=pymupdf.PDF_REDACT_TEXT_REMOVE)

    for code, lr in labels:
        above = [c for c in clusters if c.y1 <= lr.y0 + 30 and min(c.x1, lr.x1) - max(c.x0, lr.x0) > -40]
        card = min(above or clusters, key=lambda c: abs(lr.y0 - c.y1) + 0.2 * abs((c.x0 + c.x1) / 2 - (lr.x0 + lr.x1) / 2))
        pix = tp.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=card, alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        # mask profile-box overlap (already redacted, but its area is now page-white)
        masks = []
        for bx in boxes:
            ov = bx & card
            if not ov.is_empty:
                masks.append((int((ov.x0 - card.x0) * ZOOM), int((ov.y0 - card.y0) * ZOOM), int((ov.x1 - card.x0) * ZOOM) + 1, int((ov.y1 - card.y0) * ZOOM) + 1))
        cut = cutout(img, masks, int(15 * ZOOM))
        fn = f"{slug(code)}.webp"
        cut.save(os.path.join(OUT_IMG, fn), "WEBP", quality=86, method=6)

        prof = None
        if outlines:
            box = min(boxes, key=lambda bx: rect_dist(bx, lr))
            inside = [d for d in outlines if pymupdf.Rect(d["rect"]) in (box + (-2, -2, 2, 2))]
            o = max(inside, key=lambda d: len(d["items"])) if inside else None
            orr = pymupdf.Rect(o["rect"]) if o else None
            if o and rect_dist(box, lr) < 60:
                prof = {"w": round(orr.width, 2), "h": round(orr.height, 2), "d": path_d(o["items"], orr.x0, orr.y0)}
        if prof:
            profiles[code] = prof
        report.append({"code": code, "page": pno, "image": fn, "size": cut.size, "profile": bool(prof)})

# ---- compositions
comps = []
for n, pno in enumerate(range(20, 24), start=1):
    page = doc[pno - 1]
    xref = page.get_images(full=True)[0][0]
    pix = pymupdf.Pixmap(doc, xref)
    if pix.n != 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    Image.frombytes("RGB", (pix.width, pix.height), pix.samples).save(os.path.join(OUT_COMP, f"composition-{n}.webp"), "WEBP", quality=84, method=6)
    W, H = page.rect.width, page.rect.height
    lines = [d for d in page.get_drawings() if d.get("color") == (1.0, 1.0, 1.0) and len(d["items"]) == 1 and d["items"][0][0] == "l"]
    spots = []
    for blk in page.get_text("dict")["blocks"]:
        for ln in blk.get("lines", []):
            raw = norm_code("".join(s["text"] for s in ln["spans"]))
            lr = pymupdf.Rect(ln["bbox"])
            best, anchor = None, None
            for d in lines:
                a, b = d["items"][0][1], d["items"][0][2]
                da, db = rect_dist(lr, pymupdf.Rect(a, a)), rect_dist(lr, pymupdf.Rect(b, b))
                score = min(da, db)
                if best is None or score < best:
                    best, anchor = score, (b if da < db else a)
            if anchor is None or best > 25:
                anchor = pymupdf.Point((lr.x0 + lr.x1) / 2, (lr.y0 + lr.y1) / 2)
            spots.append({"label": raw, "x": round(anchor.x / W * 100, 2), "y": round(anchor.y / H * 100, 2),
                          "lx": round((lr.x0 + lr.x1) / 2 / W * 100, 2), "ly": round((lr.y0 + lr.y1) / 2 / H * 100, 2)})
    comps.append({"id": n, "image": f"composition-{n}.webp", "width": pix.width, "height": pix.height, "spots": spots})

# ---- logo (page 3 header): mark pieces + wordmark letters
page = doc[2]
logo_items = [d for d in page.get_drawings() if d.get("fill") and not d.get("color") and pymupdf.Rect(d["rect"]).y1 < 110 and pymupdf.Rect(d["rect"]).x0 > 70 and pymupdf.Rect(d["rect"]).width < 100]
lb = pymupdf.Rect(logo_items[0]["rect"])
for d in logo_items:
    lb |= pymupdf.Rect(d["rect"])
logo = {"w": round(lb.width, 2), "h": round(lb.height, 2), "outer": [], "inner": [], "word": []}
for d in logo_items:
    f = d["fill"]
    key = "inner" if f[0] > 0.8 else ("outer" if f[1] > f[0] + 0.05 else "word")
    logo[key].append(path_d(d["items"], lb.x0, lb.y0))

json.dump(profiles, open(os.path.join(OUT_DATA, "profiles.json"), "w"), indent=1)
json.dump(comps, open(os.path.join(OUT_DATA, "compositions.json"), "w"), indent=1)
json.dump(logo, open(os.path.join(OUT_DATA, "logo.json"), "w"))
json.dump(report, open(os.path.join(OUT_DATA, "extract-report.json"), "w"), indent=1)
print(len(report), "products;", sum(r["profile"] for r in report), "profiles;", len(comps), "compositions;", {k: len(v) for k, v in logo.items() if isinstance(v, list)})
for r in report:
    print(r["code"], r["page"], r["size"], r["profile"])
