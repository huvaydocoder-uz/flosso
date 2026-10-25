"""Build static SVGs from extracted catalog vectors.

Usage: python -I scripts/build_svgs.py <project_root>
  public/patterns/profiles.svg   wallpaper tile of real profile cross-sections
  public/logo/flosso-logo.svg    red mark + ink wordmark (on light)
  public/logo/flosso-logo-white.svg  all white (on red)
  public/logo/flosso-mark.svg    mark only (favicon / icon)
"""
import json
import os
import sys

ROOT = sys.argv[1]
GEN = os.path.join(ROOT, "data", "generated")
prof = json.load(open(os.path.join(GEN, "profiles.json")))
logo = json.load(open(os.path.join(GEN, "logo.json")))

os.makedirs(os.path.join(ROOT, "public", "patterns"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "public", "logo"), exist_ok=True)

# a loose, hand-placed scatter so the repeat is not obvious
picks = ["FKR01-718", "FNL01-415", "FPD03-615", "FTK01-430", "FKR03-818", "FIK(P)01-818", "FIN01-612", "FPD05-515", "FKR02-718", "FTP01-440"]
picks = [p for p in picks if p in prof]
spots = [(26, 30, 0), (238, 18, 0), (120, 112, 90), (300, 150, 0), (40, 214, 0), (196, 236, 0), (330, 300, 90), (60, 330, 0), (214, 356, 0), (140, 300, 0)]
S = 420
out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">',
       '<g fill="none" stroke="#e3dad3" stroke-width="0.9" stroke-linejoin="round">']
for code, (x, y, rot) in zip(picks, spots):
    p = prof[code]
    k = 1.6
    w, h = p["w"] * k, p["h"] * k
    out.append(f'<g transform="translate({x} {y}) rotate({rot} {w / 2} {h / 2}) scale({k})"><path d="{p["d"]}" vector-effect="non-scaling-stroke"/></g>')
out.append("</g></svg>")
open(os.path.join(ROOT, "public", "patterns", "profiles.svg"), "w").write("".join(out))


def logo_svg(outer, inner, word, mark_only=False):
    w = 40.5 if mark_only else logo["w"]
    body = "".join(f'<path d="{d}" fill="{outer}"/>' for d in logo["outer"])
    body += "".join(f'<path d="{d}" fill="{inner}"/>' for d in logo["inner"])
    if not mark_only:
        body += "".join(f'<path d="{d}" fill="{word}"/>' for d in logo["word"])
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {logo["h"]}" role="img" aria-label="FLOSSO">{body}</svg>'


open(os.path.join(ROOT, "public", "logo", "flosso-logo.svg"), "w").write(logo_svg("#C62828", "#8E1B1B", "#1A1A1A"))
open(os.path.join(ROOT, "public", "logo", "flosso-logo-white.svg"), "w").write(logo_svg("#FFFFFF", "#FFFFFF", "#FFFFFF"))
open(os.path.join(ROOT, "public", "logo", "flosso-mark.svg"), "w").write(logo_svg("#C62828", "#8E1B1B", "", True))
print("ok", picks)
