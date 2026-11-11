"""Run the trained segmenters on public dataset frames and save the article's image panels.

Run with the Omni phone environment from the Omni repository root:

    runs/phone-env/Scripts/python.exe -B <this file>

Every panel is a dataset frame, its published label, or a model output on that frame. Frames
are drawn at random with fixed seeds; the choice is written to panels.json. Overlays colour
each object; a predicted object takes the colour of the labelled object it matches (IoU >= 0.5),
and predictions that match nothing are drawn grey.
"""

import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))
from services.perception.learned_segmenter import (  # noqa: E402
    LearnedSegmenterConfig,
    instances_from,
    network_input,
)
from tools.train_segmenter import HAND, targets  # noqa: E402
from tools.uois_metrics import image_measures, summarize  # noqa: E402

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "media" / "seg"
OUT.mkdir(parents=True, exist_ok=True)
SEG = ROOT / "runs" / "segmenter"
RELEASED = ROOT / "assets" / "models" / "omni-segmenter-v1.onnx"
HOCAP_ONLY = SEG / "final-hocap" / "segmenter.onnx"
EMBED = SEG / "v3-embed" / "segmenter.onnx"
DEV = {
    "V11": "subject_4__20231026_163223", "V12": "subject_6__20231025_110646",
    "V13": "subject_8__20231024_180111", "V14": "subject_3__20231024_155008",
    "V15": "subject_2__20231023_164741", "V16": "subject_7__20231022_192832",
    "V17": "subject_6__20231025_112546", "V18": "subject_1__20231025_170650",
    "V19": "subject_5__20231027_112303", "V20": "subject_2__20231022_201449",
    "V21": "subject_3__20231024_161306", "V22": "subject_7__20231022_190534",
    "V23": "subject_1__20231025_170231",
}
CAMERAS = ("105322251564", "043422252387")
PALETTE = np.array([
    (0, 114, 178), (230, 159, 0), (0, 158, 115), (204, 121, 167),
    (86, 180, 233), (213, 94, 0), (240, 228, 66), (120, 94, 240),
    (0, 90, 70), (170, 60, 40), (90, 150, 30), (40, 40, 160),
], np.uint8)
GREY = np.array((150, 150, 150), np.uint8)
HAND_RGB = np.array((255, 255, 255), np.uint8)
NATIVE = dict(boundary_threshold=0.1, minimum_seed_pixels=240, working_width=640)
GRID320 = dict(boundary_threshold=0.1, minimum_seed_pixels=60, working_width=320)
record = {}


def save(name, image_rgb):
    cv2.imwrite(str(OUT / name), cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
    return f"media/seg/{name}"


def forward(net, rgb, height):
    net.setInput(network_input(np.ascontiguousarray(rgb), height.astype(np.float32)))
    logits = net.forward()[0].astype(np.float32)
    e = np.exp(logits[:3] - logits[:3].max(axis=0))
    classes = e / e.sum(axis=0)
    contact = 1 / (1 + np.exp(-np.clip(logits[3], -30, 30)))
    return classes[1], classes[2], contact, (logits[4:] if len(logits) > 4 else None)


def segment(net, rgb, height, settings):
    """Instances, hand mask and contact probability on the input grid, as the runtime decodes."""
    config = LearnedSegmenterConfig(model_sha256="0" * 64, **settings)
    h, w = height.shape
    scale = min(1.0, config.working_width / max(h, w))
    wh, ww = int(round(h * scale / 16)) * 16, int(round(w * scale / 16)) * 16
    rgb_w = cv2.resize(rgb, (ww, wh), interpolation=cv2.INTER_AREA) if (wh, ww) != (h, w) else rgb
    height_w = cv2.resize(height.astype(np.float32), (ww, wh), interpolation=cv2.INTER_NEAREST) if (wh, ww) != (h, w) else height
    probability, hand, contact, embedding = forward(net, rgb_w, height_w)
    instances = instances_from(probability, contact, config)
    hands = hand >= config.hand_threshold
    if (wh, ww) != (h, w):
        instances = cv2.resize(instances.astype(np.float32), (w, h), interpolation=cv2.INTER_NEAREST).astype(np.int32)
        hands = cv2.resize(hands.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0
        contact = cv2.resize(contact, (w, h), interpolation=cv2.INTER_LINEAR)
    return instances, hands, contact, embedding


def match(predicted, truth, threshold=0.5, minimum=20):
    """{predicted id: truth id} for pairs with IoU >= threshold (Hungarian on IoU)."""
    from scipy.optimize import linear_sum_assignment

    p_ids = [i for i in np.unique(predicted) if i > 0]
    t_ids = [i for i in np.unique(truth) if 0 < i < HAND and (truth == i).sum() >= minimum]
    if not p_ids or not t_ids:
        return {}, len(t_ids), len(p_ids)
    iou = np.zeros((len(t_ids), len(p_ids)))
    for a, t in enumerate(t_ids):
        tm = truth == t
        for b, p in enumerate(p_ids):
            pm = predicted == p
            inter = np.logical_and(tm, pm).sum()
            if inter:
                iou[a, b] = inter / np.logical_or(tm, pm).sum()
    rows, cols = linear_sum_assignment(-iou)
    pairs = {p_ids[c]: t_ids[r] for r, c in zip(rows, cols) if iou[r, c] >= threshold}
    return pairs, len(t_ids), len(p_ids)


def colour_of(truth_ids):
    return {t: PALETTE[k % len(PALETTE)] for k, t in enumerate(sorted(truth_ids))}


def overlay(rgb, labels, colours, hands=None, alpha=0.6, fallback=GREY):
    base = (rgb.astype(np.float32) * 0.55 + 255 * 0.45 * 0.35).astype(np.float32)
    out = base.copy()
    for i in np.unique(labels):
        if i <= 0 or i == HAND:
            continue
        m = labels == i
        c = colours.get(int(i), fallback).astype(np.float32)
        out[m] = (1 - alpha) * rgb[m] + alpha * c
    if hands is not None and hands.any():
        out[hands] = 0.25 * rgb[hands] + 0.75 * HAND_RGB
    out = np.clip(out, 0, 255).astype(np.uint8)
    if hands is not None and hands.any():
        contours, _ = cv2.findContours(hands.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(out, contours, -1, (90, 90, 90), 1, lineType=cv2.LINE_AA)
    for i in np.unique(labels):
        if i <= 0 or i == HAND:
            continue
        m = (labels == i).astype(np.uint8)
        contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = colours.get(int(i), fallback)
        cv2.drawContours(out, contours, -1, tuple(int(v) for v in (c * 0.6)), 1, lineType=cv2.LINE_AA)
    return out


def height_image(height):
    valid = np.isfinite(height)
    h = np.clip(np.where(valid, height, 0), -0.02, 0.30)
    scaled = ((h + 0.02) / 0.32 * 255).astype(np.uint8)
    image = cv2.cvtColor(cv2.applyColorMap(scaled, cv2.COLORMAP_VIRIDIS), cv2.COLOR_BGR2RGB)
    image[~valid] = (24, 24, 24)
    return image


def heat(values, rgb=None):
    image = cv2.cvtColor(cv2.applyColorMap((np.clip(values, 0, 1) * 255).astype(np.uint8), cv2.COLORMAP_INFERNO), cv2.COLOR_BGR2RGB)
    if rgb is not None:
        grey = cv2.cvtColor(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), cv2.COLOR_GRAY2RGB)
        weight = np.clip(values, 0, 1)[..., None] * 0.85 + 0.15
        image = (weight * image + (1 - weight) * grey * 0.6).astype(np.uint8)
    return image


def crop_box(masks, shape, margin=0.18, aspect=4 / 3, minimum=0.24):
    """One 4:3 box around every mask in a row, so all columns of the row share the crop."""
    union = np.zeros(shape, bool)
    for m in masks:
        union |= m
    h, w = shape
    if not union.any():
        return (0, h, 0, w)
    rows, cols = np.flatnonzero(union.any(axis=1)), np.flatnonzero(union.any(axis=0))
    y0, y1, x0, x1 = rows[0], rows[-1] + 1, cols[0], cols[-1] + 1
    bh, bw = (y1 - y0) * (1 + 2 * margin), (x1 - x0) * (1 + 2 * margin)
    bw = max(bw, bh * aspect, w * minimum)
    bw, bh = min(bw, w, h * aspect), min(bw, w, h * aspect) / aspect
    cy, cx = (y0 + y1) / 2, (x0 + x1) / 2
    top = int(round(min(max(cy - bh / 2, 0), h - bh)))
    left = int(round(min(max(cx - bw / 2, 0), w - bw)))
    return (top, top + int(round(bh)), left, left + int(round(bw)))


def cut(image, box):
    return np.ascontiguousarray(image[box[0]:box[1], box[2]:box[3]])


rng = np.random.default_rng(20261110)

# 1. What the network is trained on: inputs and targets from both training datasets.
inputs = []
picks = [
    ("cache", "hocap__subject_3__20231024_154810__105322251564", "HO-Cap"),
    ("cache", "hocap__subject_3__20231024_154810__043422252387", "HO-Cap"),
    ("cache-ocid", "ocid__ARID20__table__top__seq08", "OCID ARID20"),
    ("cache-ocid", "ocid__ARID10__floor__top__mixed__seq05", "OCID ARID10"),
]
for folder, stem, dataset in picks:
    path = SEG / folder / f"{stem}.npz"
    if not path.exists():
        stem = sorted(p.stem for p in (SEG / folder).glob(stem.rsplit("__", 1)[0] + "*.npz"))[0]
        path = SEG / folder / f"{stem}.npz"
    with np.load(path) as z:
        j = int(rng.integers(len(z["rgb"])))
        rgb, height, label = z["rgb"][j], z["height"][j].astype(np.float32), z["label"][j]
    semantic, contact = targets(label)
    colours = colour_of([i for i in np.unique(label) if 0 < i < HAND])
    box = crop_box([(label > 0) & (label != HAND)], label.shape)
    row = {"dataset": dataset, "source": f"{folder}/{stem}", "frame": j, "crop": box}
    row["colour"] = save(f"in-{len(inputs)}-rgb.jpg", cut(rgb, box))
    row["height"] = save(f"in-{len(inputs)}-height.jpg", cut(height_image(height), box))
    row["label"] = save(f"in-{len(inputs)}-label.jpg", cut(overlay(rgb, label, colours, hands=label == HAND, alpha=0.75), box))
    row["contact"] = save(f"in-{len(inputs)}-contact.jpg", cut(heat(cv2.dilate(contact, np.ones((3, 3), np.uint8)), rgb), box))
    row["objects"] = int(len(colours))
    inputs.append(row)
record["inputs"] = inputs
print("inputs", [(r["dataset"], r["frame"]) for r in inputs])

# 2. Released model on recordings it never trained on that passed every gate in their round.
net = cv2.dnn.readNetFromONNX(str(RELEASED))
held = []
PASSED = ["V12", "V14", "V16", "V18", "V19", "V20", "V21", "V22", "V23"]  # every gate passed in their round
rng = np.random.default_rng(20261111)
for name in rng.choice(PASSED, 6, replace=False):
    camera = CAMERAS[int(rng.integers(2))]
    stem = f"hocap__{DEV[name]}__{camera}"
    with np.load(SEG / "cache-dev640" / f"{stem}.npz") as z:
        j = int(rng.integers(len(z["rgb"])))
        rgb, height, label = z["rgb"][j], z["height"][j].astype(np.float32), z["label"][j]
    instances, hands, contact, _ = segment(net, rgb, height, NATIVE)
    pairs, n_truth, n_pred = match(instances, label)
    colours = colour_of([i for i in np.unique(label) if 0 < i < HAND])
    k = len(held)
    box = crop_box([(label > 0) & (label != HAND), instances > 0], label.shape)
    held.append({
        "recording": str(name), "camera": camera, "frame": j, "crop": box,
        "colour": save(f"held-{k}-rgb.jpg", cut(rgb, box)),
        "truth": save(f"held-{k}-truth.jpg", cut(overlay(rgb, label, colours, hands=label == HAND), box)),
        "predicted": save(f"held-{k}-pred.jpg", cut(overlay(rgb, instances, {p: colours[t] for p, t in pairs.items()}, hands=hands), box)),
        "matched": len(pairs), "truth_objects": n_truth, "predicted_objects": n_pred,
    })
record["heldout"] = held
print("held", [(r["recording"], r["matched"], r["truth_objects"], r["predicted_objects"]) for r in held])

# 3. OCID YCB10 (objects never trained on): HO-Cap-only model against HO-Cap + OCID ARID.
models = {"hocap": cv2.dnn.readNetFromONNX(str(HOCAP_ONLY)), "mixed": net}
rng = np.random.default_rng(20261112)
stems = sorted(p.stem for p in (SEG / "cache-ocid").glob("ocid__YCB10__*.npz"))
ocid = []
for stem in rng.choice(stems, 5, replace=False):
    with np.load(SEG / "cache-ocid" / f"{stem}.npz") as z:
        j = int(rng.integers(len(z["rgb"])))
        rgb, height = z["rgb"][j], z["height"][j].astype(np.float32)
        full = z["label_full"][j]
    truth = np.where(full == HAND, 0, full)
    small = cv2.resize(truth.astype(np.float32), (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_NEAREST).astype(np.int32)
    colours = colour_of([i for i in np.unique(small) if i > 0])
    box = crop_box([small > 0], small.shape, margin=0.3, minimum=0.45)
    k = len(ocid)
    row = {"sequence": str(stem).replace("ocid__", "").replace("__", "/"), "frame": j,
           "colour": save(f"ocid-{k}-rgb.jpg", cut(rgb, box)), "crop": box,
           "truth": save(f"ocid-{k}-truth.jpg", cut(overlay(rgb, small, colours), box)),
           "truth_objects": int(len([i for i in np.unique(truth) if i > 0]))}
    for key, model in models.items():
        instances, _, _, _ = segment(model, rgb, height, GRID320)
        upsampled = cv2.resize(instances.astype(np.float32), (truth.shape[1], truth.shape[0]), interpolation=cv2.INTER_NEAREST).astype(np.int32)
        measures = image_measures(upsampled, truth)
        pairs, _, _ = match(instances, small)
        row[key] = save(f"ocid-{k}-{key}.jpg", cut(overlay(rgb, instances, {p: colours[t] for p, t in pairs.items()}), box))
        row[f"{key}_uois"] = summarize([measures])
    ocid.append(row)
record["ocid"] = ocid
print("ocid", [(r["sequence"], r["truth_objects"]) for r in ocid])

# 4. Instance embedding (8 channels, trained jointly) on V11, where two boxes touch.
embed = cv2.dnn.readNetFromONNX(str(EMBED))
emb_rows = []
for name, camera, frame in (("V11", "105322251564", 60),):
    stem = f"hocap__{DEV[name]}__{camera}"
    with np.load(SEG / "cache-dev640" / f"{stem}.npz") as z:
        rgb, height, label = z["rgb"][frame], z["height"][frame].astype(np.float32), z["label"][frame]
    instances, hands, _, _ = segment(net, rgb, height, NATIVE)
    small_rgb = cv2.resize(rgb, (320, 240), interpolation=cv2.INTER_AREA)
    small_h = cv2.resize(height, (320, 240), interpolation=cv2.INTER_NEAREST)
    probability, _, _, embedding = forward(embed, small_rgb, small_h)
    objects = probability >= 0.5
    vectors = embedding[:, objects].T
    centred = vectors - vectors.mean(axis=0)
    _, _, axes = np.linalg.svd(centred, full_matrices=False)
    projected = centred @ axes[:3].T
    low, high = np.percentile(projected, 2, axis=0), np.percentile(projected, 98, axis=0)
    rgb_map = np.full((240, 320, 3), 235, np.uint8)
    rgb_map[objects] = (np.clip((projected - low) / (high - low + 1e-6), 0, 1) * 255).astype(np.uint8)
    rgb_map = cv2.resize(rgb_map, (640, 480), interpolation=cv2.INTER_NEAREST)
    pairs, n_truth, n_pred = match(instances, label)
    colours = colour_of([i for i in np.unique(label) if 0 < i < HAND])
    k = len(emb_rows)
    box = crop_box([(label > 0) & (label != HAND), instances > 0], label.shape, margin=0.15)
    emb_rows.append({
        "recording": name, "camera": camera, "frame": frame, "crop": box,
        "colour": save(f"emb-{k}-rgb.jpg", cut(rgb, box)),
        "truth": save(f"emb-{k}-truth.jpg", cut(overlay(rgb, label, colours, hands=label == HAND), box)),
        "predicted": save(f"emb-{k}-pred.jpg", cut(overlay(rgb, instances, {p: colours[t] for p, t in pairs.items()}, hands=hands), box)),
        "embedding": save(f"emb-{k}-embedding.jpg", cut(rgb_map, box)),
        "matched": len(pairs), "truth_objects": n_truth, "predicted_objects": n_pred,
    })
record["embedding"] = emb_rows
print("embedding", [(r["recording"], r["matched"], r["truth_objects"], r["predicted_objects"]) for r in emb_rows])

# 5. A held-out recording end to end, both cameras, every frame: released model overlay.
video_name = "V22"
writer = None
data = {c: np.load(SEG / "cache-dev640" / f"hocap__{DEV[video_name]}__{c}.npz") for c in CAMERAS}
boxes = {c: crop_box([((data[c]["label"] > 0) & (data[c]["label"] != HAND)).any(axis=0)], (480, 640), margin=0.3) for c in CAMERAS}
for j in range(120 if not (OUT / "heldout-v22.webm").exists() else 0):
    tiles = []
    for camera in CAMERAS:
        rgb, height, label = data[camera]["rgb"][j], data[camera]["height"][j].astype(np.float32), data[camera]["label"][j]
        instances, hands, _, _ = segment(net, rgb, height, NATIVE)
        pairs, _, _ = match(instances, label)
        colours = colour_of([i for i in np.unique(label) if 0 < i < HAND])
        tile = cut(overlay(rgb, instances, {p: colours[t] for p, t in pairs.items()}, hands=hands), boxes[camera])
        tiles.append(cv2.resize(tile, (480, 360), interpolation=cv2.INTER_AREA))
    frame = np.hstack([tiles[0], np.full((360, 8, 3), 255, np.uint8), tiles[1]])
    if writer is None:
        writer = cv2.VideoWriter(str(OUT / "heldout-v22.webm"), cv2.VideoWriter_fourcc(*"VP90"), 15, (frame.shape[1], frame.shape[0]))
        cv2.imwrite(str(OUT / "heldout-v22-poster.jpg"), cv2.cvtColor(frame, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])
    writer.write(cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
if writer is not None:
    writer.release()
record["video"] = {"recording": video_name, "frames": "0-119", "cameras": CAMERAS, "fps": 15, "real_time_fps": 30}

record["models"] = {"released": str(RELEASED.relative_to(ROOT)), "hocap_only": str(HOCAP_ONLY.relative_to(ROOT)), "embedding": str(EMBED.relative_to(ROOT))}
record["settings"] = {"native": NATIVE, "grid320": GRID320, "object_threshold": 0.5}
(HERE / "panels.json").write_text(json.dumps(record, indent=1, default=str))
print("done")
