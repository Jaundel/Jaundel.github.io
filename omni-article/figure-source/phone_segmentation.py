"""Omni's current perception on a recorded two-phone session, as a side-by-side video.

Run with the Omni phone environment from the Omni repository root (PYTHONPATH=.). Session:
runs/omni-demo-live, 23 October 2026, recorded with the earlier depth-component perception; the
released segmenter never saw it. Each frame goes through tools.phone_demo.detected, the live
single-camera perception, with configs/tabletop-phone-learned.json and the session's own work
area, so every admission gate applies as in the running system. The accepted masks come back on
the 256 x 192 depth grid and are drawn over the phone's colour image. Colours follow objects by
their position on the table (a new colour for an object more than 6 cm from every earlier one).
Images are rotated a quarter turn for display.
"""

import glob
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))
from tools.capture_record3d import load_packet  # noqa: E402
from tools.phone_demo import detected  # noqa: E402

SESSION = ROOT / "runs" / "omni-demo-live"
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "media" / "scene"
OUT.mkdir(parents=True, exist_ok=True)
PHONES = tuple(sys.argv[2].split(",")) if len(sys.argv) > 2 else ("phone1", "phone2")
PALETTE = [(0, 114, 178), (230, 159, 0), (0, 158, 115), (204, 121, 167), (86, 180, 233), (213, 94, 0), (120, 94, 240), (240, 228, 66), (0, 90, 70), (170, 60, 40)]
perception = json.loads((ROOT / "configs/tabletop-phone-learned.json").read_text())
perception["roi_xy_m"] = json.loads((SESSION / "perception.json").read_text())["roi_xy_m"]
poses = {c: np.array(json.loads((SESSION / f"calibration-01/{c}/profile.json").read_text())["T_WC"]) for c in ("phone1", "phone2")}
COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 160
SIZE = (480, 640)  # display width, height before rotation (portrait colour image)


def draw(rgb, masks, colours):
    image = cv2.resize(rgb, SIZE, interpolation=cv2.INTER_AREA).astype(np.float32)
    out = image * 0.82 + 255 * 0.18 * 0.25
    edges = []
    for m, colour in zip(masks, colours):
        soft = cv2.resize(m.astype(np.float32), SIZE, interpolation=cv2.INTER_LINEAR)
        soft = cv2.GaussianBlur(soft, (0, 0), 2.0)
        big = soft > 0.5
        out[big] = 0.42 * image[big] + 0.58 * np.array(colour, np.float32)
        edges.append((big, colour))
    out = np.clip(out, 0, 255).astype(np.uint8)
    for big, colour in edges:
        contours, _ = cv2.findContours(big.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(out, contours, -1, tuple(int(v * 0.55) for v in colour), 2, cv2.LINE_AA)
    return cv2.rotate(out, cv2.ROTATE_90_COUNTERCLOCKWISE)


rows = {c: [] for c in ("phone1", "phone2")}
for meta in sorted(glob.glob(str(SESSION / "session-01/input/raw/*/*.json"))):
    info = json.loads(Path(meta).read_text())
    rows[info["camera_id"]].append((int(info["host_receive_ns"]), meta))
start = max(r[0][0] for r in rows.values())
end = min(r[-1][0] for r in rows.values())
known = []
frames, counts, times_s = [], [], []
for t in np.linspace(start, end, COUNT):
    tiles = []
    for c in PHONES:
        frame = load_packet(Path(min(rows[c], key=lambda r: abs(r[0] - t))[1]))
        masks, layout, _ = detected(frame, poses[c], perception, observations=True)
        colours = []
        for m, (xy, _) in zip(masks, layout):
            xy = np.asarray(xy)
            near = [k for k in known if np.linalg.norm(k[0] - xy) < 0.06]
            if near:
                match = min(near, key=lambda k: np.linalg.norm(k[0] - xy))
                match[0][:] = xy
                colours.append(match[1])
            else:
                known.append((xy.copy(), PALETTE[len(known) % len(PALETTE)]))
                colours.append(known[-1][1])
        counts.append(len(masks))
        tiles.append(draw(frame.rgb, masks, colours))
    gap = np.full((tiles[0].shape[0], 10, 3), 255, np.uint8)
    frames.append(np.hstack([tiles[0], gap, tiles[1]]) if len(tiles) > 1 else tiles[0])
    times_s.append(round((t - start) / 1e9, 1))
writer = cv2.VideoWriter(str(OUT / "phones-segmented.webm"), cv2.VideoWriter_fourcc(*"VP90"), 8, frames[0].shape[1::-1])
for f in frames:
    writer.write(cv2.cvtColor(f, cv2.COLOR_RGB2BGR))
writer.release()
for k in range(len(frames)) if "--all" in sys.argv else sorted({0, len(frames) // 4, len(frames) // 2, 3 * len(frames) // 4, len(frames) - 1}):
    cv2.imwrite(str(OUT / f"phones-segmented-{k}.jpg"), cv2.cvtColor(frames[k], cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
(HERE / "phone_segmentation.json").write_text(json.dumps({
    "session": "runs/omni-demo-live/session-01", "frames": len(frames), "phones": list(PHONES), "times_s": times_s, "span_s": round((end - start) / 1e9, 1),
    "masks_per_view": [int(min(counts)), int(np.median(counts)), int(max(counts))], "colours_used": len(known)}, indent=1))
print(len(frames), round((end - start) / 1e9, 1), "s;", "masks per view", min(counts), np.median(counts), max(counts), ";", len(known), "colours")
