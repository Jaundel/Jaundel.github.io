"""Write the image-grid figures into ../index.html from panels.json (python grids.py).

Row labels are taken from panels.json, which segmenter_panels.py writes alongside the images,
so every count and score shown beside a row is the one computed for that row.
"""

import html
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent / "index.html"
panels = json.loads((HERE / "panels.json").read_text())
CAMERA = {"105322251564": "105", "043422252387": "043"}


def img(src, alt):
    return f'<img src="./{src}" alt="{html.escape(alt)}" loading="lazy" width="640" height="480" />'


def heads(names):
    return '<div class="corner"></div>' + "".join(f'<div class="colhead">{n}</div>' for n in names)


def row(label, images):
    return f'<div class="rowhead">{label}</div>' + "".join(img(src, alt) for src, alt in images)


blocks = {}

out = [heads(["Colour", "Height above table", "Label", "Contact target"])]
for r in panels["inputs"]:
    name = r["source"].split("/", 1)[1]
    if r["dataset"] == "HO-Cap":
        where = f"camera {CAMERA[name.rsplit('__', 1)[1]]}"
    else:
        where = " / ".join(name.split("__")[2:])
    label = f'<b>{r["dataset"]}</b>{where}<br><span class="note">frame {r["frame"]}, {r["objects"]} objects</span>'
    out.append(row(label, [(r["colour"], f'{r["dataset"]} colour frame'), (r["height"], "Height above the table"),
                           (r["label"], "Object and hand labels"), (r["contact"], "Contact target")]))
blocks["inputs"] = out

out = [heads(["Colour", "Label", "Released model"])]
for r in panels["heldout"]:
    note = f'{r["matched"]} of {r["truth_objects"]} objects matched'
    if r["truth_objects"] and r["predicted_objects"] == 0 and r["recording"] == "V17":
        note += "; see caption"
    label = f'<b>{r["recording"]}</b>camera {CAMERA[r["camera"]]}, frame {r["frame"]}<br><span class="note">{note}</span>'
    out.append(row(label, [(r["colour"], f'{r["recording"]} colour frame'), (r["truth"], "Published label"),
                           (r["predicted"], "Released model's instances")]))
blocks["heldout"] = out

out = [heads(["Colour", "Label", "HO-Cap only", "HO-Cap and OCID"])]
for r in panels["ocid"]:
    parts = r["sequence"].split("/")
    a, b = r["hocap_uois"]["overlap_f"], r["mixed_uois"]["overlap_f"]
    label = (f'<b>{parts[1]}, {parts[3]}</b>{parts[2]} view, {parts[4]}, frame {r["frame"]}'
             f'<br><span class="note">{r["truth_objects"]} objects · F {a:.2f} → {b:.2f}</span>')
    out.append(row(label, [(r["colour"], "OCID YCB10 colour frame"), (r["truth"], "Published label"),
                           (r["hocap"], "HO-Cap-only model"), (r["mixed"], "HO-Cap and OCID model")]))
blocks["ocid"] = out

out = [heads(["Colour", "Label", "Released model", "Embedding, 3 components"])]
for r in panels["embedding"]:
    label = (f'<b>{r["recording"]}</b>camera {CAMERA[r["camera"]]}, frame {r["frame"]}'
             f'<br><span class="note">released model: {r["matched"]} of {r["truth_objects"]} matched, {r["predicted_objects"]} instances</span>')
    out.append(row(label, [(r["colour"], f'{r["recording"]} colour frame'), (r["truth"], "Published label"),
                           (r["predicted"], "Released model's instances"), (r["embedding"], "Embedding projected to colour")]))
blocks["embedding"] = out

page = PAGE.read_text(encoding="utf-8")
for name, parts in blocks.items():
    body = "\n        ".join(parts)
    pattern = re.compile(rf"<!-- grid:{name} -->.*?<!-- /grid:{name} -->", re.S)
    if not pattern.search(page):
        raise SystemExit(f"no grid:{name} block in index.html")
    page = pattern.sub(lambda m: f"<!-- grid:{name} -->\n        {body}\n        <!-- /grid:{name} -->", page)
PAGE.write_text(page, encoding="utf-8")
print("grids placed:", ", ".join(blocks))
