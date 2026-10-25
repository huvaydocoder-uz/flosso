"""Render real catalog profiles as lit mouldings (elevation view) -> CSS gradients.

Each profile section from the catalog is "extruded": along the band we read how far the
moulding projects from the wall, then light it from the upper front. Surfaces facing up
catch the light, undercuts fall into shadow — the way a cornice reads on a facade.

Usage: python -I scripts/build_friezes.py <project_root>
Writes data/generated/friezes.json  {code: [[pct, "#rrggbb"], ...]}
       public/patterns/lattice-*.svg (the FLOSSO mark as an art-deco lattice tile)
"""
import json
import math
import os
import re
import sys

ROOT = sys.argv[1]
GEN = os.path.join(ROOT, "data", "generated")
profiles = json.load(open(os.path.join(GEN, "profiles.json")))
logo = json.load(open(os.path.join(GEN, "logo.json")))

CODES = ["FKR01-718", "FKR03-818", "FKR04-817", "FKR02-718", "FPD01-615", "FPD04-615", "FNL01-415", "FNL04-315", "FTK01-430", "FTP01-440"]


def flatten(d):
    """M/L/C/Z path (as written by extract_catalog.py) -> list of polylines"""
    toks = re.findall(r"[MLCZ]|-?\d*\.?\d+", d)
    i, cur, lines, poly = 0, None, [], []
    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v
    while i < len(toks):
        t = toks[i]; i += 1
        if t == "M":
            if len(poly) > 1: lines.append(poly)
            cur = (num(), num()); poly = [cur]
        elif t == "L":
            cur = (num(), num()); poly.append(cur)
        elif t == "C":
            p0 = cur; p1 = (num(), num()); p2 = (num(), num()); p3 = (num(), num())
            for k in range(1, 13):
                u = k / 12
                x = (1-u)**3*p0[0] + 3*(1-u)**2*u*p1[0] + 3*(1-u)*u**2*p2[0] + u**3*p3[0]
                y = (1-u)**3*p0[1] + 3*(1-u)**2*u*p1[1] + 3*(1-u)*u**2*p2[1] + u**3*p3[1]
                poly.append((x, y))
            cur = p3
        elif t == "Z":
            if poly: poly.append(poly[0])
    if len(poly) > 1: lines.append(poly)
    return lines


def projection(prof, n=240):
    lines = flatten(prof["d"])
    w, h = prof["w"], prof["h"]
    segs = [(a, b) for pl in lines for a, b in zip(pl, pl[1:])]
    out = []
    for k in range(n + 1):
        x = w * (0.002 + 0.996 * k / n)
        ys = []
        for (x1, y1), (x2, y2) in segs:
            if (x1 - x) * (x2 - x) <= 0 and x1 != x2:
                ys.append(y1 + (y2 - y1) * (x - x1) / (x2 - x1))
        out.append(h - min(ys) if ys else 0.0)
    return w, out


def hexc(r, g, b):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in (r, g, b))


def shade(prof):
    w, p = projection(prof)
    if p[0] < p[-1]:  # crown (largest projection) at the top of the band
        p = p[::-1]
    n = len(p) - 1
    ds = w / n
    light = (-0.62, 0.78)  # towards the light: up and in front
    stops = []
    for k in range(n + 1):
        a = p[max(k - 1, 0)]; b = p[min(k + 1, n)]
        dp = (b - a) / (2 * ds if 0 < k < n else ds)
        norm = math.hypot(dp, 1)
        lit = (-light[0] * dp + light[1]) / norm  # n = (-dp, 1); s grows downward
        v = 0.5 + 0.5 * max(-1.0, min(1.0, lit))
        # warm foam: shadow #b3a89f -> light #ffffff
        lo, hi = (146, 136, 128), (255, 255, 255)
        c = hexc(*(lo[j] + (hi[j] - lo[j]) * v ** 2.1 for j in range(3)))
        stops.append([round(100 * k / n, 2), c])
    # merge runs of equal colour
    merged = [stops[0]]
    for s in stops[1:]:
        if s[1] != merged[-1][1] or s is stops[-1]:
            merged.append(s)
    return merged


out = {c: shade(profiles[c]) for c in CODES if c in profiles}
json.dump(out, open(os.path.join(GEN, "friezes.json"), "w"))
print({k: len(v) for k, v in out.items()})

# ---- lattice tile from the FLOSSO mark (outer meander pieces only)
mark = "".join(f'<path d="{d}"/>' for d in logo["outer"] + logo["inner"])
def tile(fill, opacity, name, size=88, scale=0.62):
    m = 40.5 * scale
    pos = [(0, 0), (size, 0), (0, size), (size, size), (size / 2, size / 2)]
    g = "".join(f'<g transform="translate({x - m / 2:.2f} {y - m / 2:.2f}) scale({scale})">{mark}</g>' for x, y in pos)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}"><g fill="{fill}" fill-opacity="{opacity}">{g}</g></svg>'
    open(os.path.join(ROOT, "public", "patterns", f"lattice-{name}.svg"), "w").write(svg)
tile("#ffffff", 0.07, "on-red")
tile("#8e1b1b", 0.045, "on-light")
tile("#ffffff", 0.05, "on-ink")
print("lattice ok")
