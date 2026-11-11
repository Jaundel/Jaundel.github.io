"""Render one recorded two-phone moment in 3D: both phones' depth, fused in the table frame.

Run with the Omni phone environment from the Omni repository root. Reads the raw Record3D
packets and the calibration profiles of runs/omni-demo-live (23 October 2026) and the record's
saved state at the same update. Every point is a measured LiDAR depth pixel, back-projected with
the phone's intrinsics and moved into the table frame with its calibrated pose, coloured from the
phone's own colour image. Markers are the record's track positions at that update. The camera
path is a virtual orbit; nothing is added to or removed from the measured points.
"""

import glob
import json
import sys
from pathlib import Path

import cv2
import numpy as np

SESSION = Path("runs/omni-demo-live")
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "media" / "scene"
OUT.mkdir(parents=True, exist_ok=True)
UPDATE = int(sys.argv[1]) if len(sys.argv) > 1 else 300
PHONES = ("phone1", "phone2")
MARK = [(0, 114, 178), (230, 159, 0), (0, 158, 115), (204, 121, 167), (86, 180, 233), (213, 94, 0), (120, 94, 240), (0, 90, 70), (170, 60, 40)]


def packets():
    rows = {c: [] for c in PHONES}
    for meta in sorted(glob.glob(str(SESSION / "session-01/input/raw/*/*.json"))):
        info = json.loads(Path(meta).read_text())
        rows[info["camera_id"]].append((info["frame_id"], int(info["host_receive_ns"]), meta))
    return rows


def points(meta, profile):
    info = json.loads(Path(meta).read_text())
    with np.load(meta[:-5] + ".npz") as z:
        rgb, depth, confidence = z["rgb"], z["depth"].astype(np.float64), z["confidence"]
    h, w = depth.shape
    k = np.array(info["rgb_intrinsics"], np.float64) * (w / info["rgb_shape"][1])
    v, u = np.mgrid[0:h, 0:w]
    xyz = np.stack([(u + 0.5 - k[0, 2]) / k[0, 0] * depth, (v + 0.5 - k[1, 2]) / k[1, 1] * depth, depth], -1).reshape(-1, 3)
    t = np.array(profile["T_WC"], np.float64)
    world = xyz @ t[:3, :3].T + t[:3, 3]
    small = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_AREA).reshape(-1, 3)
    keep = (depth.ravel() > 0) & np.isfinite(world).all(1) & (confidence.ravel() >= profile.get("min_confidence", 2))
    return world[keep], small[keep], rgb, info, t


def look_at(eye, target, up=(0, 0, 1)):
    f = np.asarray(target, float) - eye
    f /= np.linalg.norm(f)
    r = np.cross(f, up)
    r /= np.linalg.norm(r)
    d = np.cross(f, r)
    return np.stack([r, d, f])  # rows: camera x (right), y (down), z (forward)


def render(world, colour, eye, target, size=(960, 570), focal=830, splat=4, scale=2):
    W, H = size[0] * scale, size[1] * scale
    rot = look_at(np.asarray(eye, float), target)
    cam = (world - eye) @ rot.T
    front = cam[:, 2] > 0.05
    cam, col = cam[front], colour[front]
    px = (cam[:, 0] / cam[:, 2] * focal * scale + W / 2).astype(int)
    py = (cam[:, 1] / cam[:, 2] * focal * scale + H / 2).astype(int)
    order = np.argsort(-cam[:, 2])
    image = np.full((H, W, 3), 250, np.uint8)
    r = splat * scale // 2
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            x, y = px[order] + dx, py[order] + dy
            ok = (x >= 0) & (x < W) & (y >= 0) & (y < H)
            image[y[ok], x[ok]] = col[order][ok]
    return image, rot, (W, H)


def project(p, eye, rot, wh, focal=830, scale=2):
    c = (np.asarray(p, float) - eye) @ rot.T
    return int(c[0] / c[2] * focal * scale + wh[0] / 2), int(c[1] / c[2] * focal * scale + wh[1] / 2)


def draw_tracks(image, tracks, eye, rot, wh, scale=2):
    for n, (tid, pos, colour) in enumerate(tracks):
        base = project([pos[0], pos[1], 0.0], eye, rot, wh)
        top = project([pos[0], pos[1], pos[2] + 0.06], eye, rot, wh)
        cv2.line(image, base, top, colour, 2 * scale, cv2.LINE_AA)
        cv2.circle(image, top, 13 * scale, colour, -1, cv2.LINE_AA)
        label = str(int(tid.split("-")[-1]))
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55 * scale, 2 * scale)
        cv2.putText(image, label, (top[0] - tw // 2, top[1] + th // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.55 * scale, (255, 255, 255), 2 * scale, cv2.LINE_AA)


profiles = {c: json.loads((SESSION / f"calibration-01/{c}/profile.json").read_text()) for c in PHONES}
roi = json.loads((SESSION / "perception.json").read_text())["roi_xy_m"]
state = json.loads((SESSION / f"session-01/authoritative_{UPDATE:06d}.json").read_text())
samples = {s["camera_id"]: s["frame_id"] for s in state["camera_samples"]}
rows = packets()
clouds, colours, record = [], [], {"update": UPDATE, "phones": {}}
for c in PHONES:
    meta = min(rows[c], key=lambda r: abs(r[0] - samples[c]))[2]
    world, colour, rgb, info, t = points(meta, profiles[c])
    inside = (world[:, 0] > roi[0] + 0.02) & (world[:, 0] < roi[1] - 0.02) & (world[:, 1] > roi[2] + 0.02) & (world[:, 1] < roi[3] - 0.02) & (world[:, 2] > -0.015) & (world[:, 2] < 0.3)
    clouds.append(world[inside])
    colours.append(colour[inside])
    record["phones"][c] = {"packet": str(Path(meta).relative_to(SESSION)), "frame_id": info["frame_id"], "points": int(inside.sum())}
world, colour = np.concatenate(clouds), np.concatenate(colours)
tracks = [(t["track_id"], t["position_m"], MARK[k % len(MARK)]) for k, t in enumerate(state["latest_state"]["snapshot"]["tracks"]) if t["presence"] == "present"]
record["tracks"] = [{"track_id": a, "position_m": b} for a, b, _ in tracks]
centre = np.array([(roi[0] + roi[1]) / 2, (roi[2] + roi[3]) / 2, 0.04])

# Swing on the open side of the table: opposite the mean direction of tall points (the walls).
tall = world[world[:, 2] > 0.2, :2] - centre[:2]
base = np.arctan2(-tall[:, 1].mean(), -tall[:, 0].mean()) if len(tall) else 0.0
record["view_base_deg"] = float(np.degrees(base))
frames = []
for k in range(120):
    angle = base + np.radians(55) * np.sin(2 * np.pi * k / 120)
    eye = centre + np.array([0.75 * np.cos(angle), 0.75 * np.sin(angle), 0.7])
    image, rot, wh = render(world, colour, eye, centre)
    image = cv2.GaussianBlur(image, (0, 0), 0.8)
    frames.append(cv2.resize(image, (image.shape[1] // 2, image.shape[0] // 2), interpolation=cv2.INTER_AREA))
writer = cv2.VideoWriter(str(OUT / "fused-orbit.webm"), cv2.VideoWriter_fourcc(*"VP90"), 24, frames[0].shape[1::-1])
for f in frames:
    writer.write(cv2.cvtColor(f, cv2.COLOR_RGB2BGR))
writer.release()
cv2.imwrite(str(OUT / "fused-orbit-poster.jpg"), cv2.cvtColor(frames[0], cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
(HERE / "scene.json").write_text(json.dumps(record, indent=1))
print(record["phones"], len(tracks))
