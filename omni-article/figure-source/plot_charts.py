"""Figures 4, 5 and 8 with matplotlib, from the data files in data/ (python plot_charts.py).

Every value plotted is read from those files: the two training logs, the two decoder sweeps and
the per-round gate counts. Text is set in Poppins (fonts/, OFL) to match the article, and written
as outlines so it renders the same in any browser. Output: ../media/charts/*.svg.
"""

import csv
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
OUT = HERE.parent / "media" / "charts"
OUT.mkdir(parents=True, exist_ok=True)
for f in (HERE / "fonts").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
BLUE, ORANGE, INK, MUTED, GRID = "#1d63b7", "#7f939f", "#161b22", "#646c74", "#e2e6ea"
plt.rcParams.update({
    "font.family": "Poppins", "font.size": 9.5, "text.color": INK,
    "axes.edgecolor": "#9ca3af", "axes.labelcolor": MUTED, "axes.linewidth": 0.8,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.titlesize": 10, "axes.titleweight": "medium", "axes.titlelocation": "left", "axes.titlepad": 10,
    "xtick.color": MUTED, "ytick.color": MUTED, "xtick.labelsize": 8.5, "ytick.labelsize": 8.5,
    "xtick.major.size": 3, "ytick.major.size": 0, "legend.frameon": False, "legend.fontsize": 8.5,
    "svg.fonttype": "path", "figure.dpi": 100,
})


def grid(ax):
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)


def save(fig, name):
    fig.savefig(OUT / f"{name}.svg", bbox_inches="tight", pad_inches=0.05, transparent=True)
    plt.close(fig)


def pooled(validation):
    tp = sum(v["tp"] for v in validation.values())
    return 100 * tp / sum(v["truth"] for v in validation.values()), 100 * tp / sum(v["predicted"] for v in validation.values())


# Figure 4: run B loss terms; held-out recall and precision of runs A and B.
log_b = json.loads((DATA / "train-run-b-log.json").read_text())
log_a = [json.loads(line) for line in (DATA / "train-run-a-log.jsonl").read_text().splitlines()]
fig, (a, b) = plt.subplots(1, 2, figsize=(8.6, 3.1), gridspec_kw={"wspace": 0.32})
rows = [r for r in log_b if "loss" in r]
steps = [r["step"] for r in rows]
for key, name, colour, style in (("semantic", "Class (cross-entropy)", BLUE, "-"), ("dice", "Object (Dice)", INK, "--"), ("boundary", "Contact (weighted BCE)", ORANGE, "-")):
    a.plot(steps, [r[key] for r in rows], style, color=colour, lw=1.3, label=name)
a.set_yscale("log")
a.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:g}"))
a.set_xlabel("Training step")
a.set_ylabel("Loss")
a.set_title("a   Run B loss terms")
a.legend(loc="upper right")
grid(a)
for runs, colour, name in ((log_a, ORANGE, "Run A, every edge"), (log_b, BLUE, "Run B, contacts only")):
    pts = [(r["step"], *pooled(r["validation"])) for r in runs if "validation" in r]
    s = [p[0] for p in pts]
    b.plot(s, [p[1] for p in pts], "-o", color=colour, lw=1.6, ms=5, label=f"{name}, recall")
    b.plot(s, [p[2] for p in pts], "--o", color=colour, lw=1.2, ms=5, mfc="white", label=f"{name}, precision")
b.set_xlim(0, 3200)
b.set_ylim(70, 95)
b.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
b.set_xlabel("Training step")
b.set_ylabel("Held-out views, pooled")
b.set_title("b   Recall and precision on held-out recordings")
b.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), ncol=2, fontsize=8, handlelength=2.4)
grid(b)
for ax in (a, b):
    ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}"))
save(fig, "training")

# Figure 5: decoder sweep, precision against recall, coloured by seed size.
sweep = json.loads((DATA / "decoder-sweep-1.json").read_text())["rows"] + json.loads((DATA / "decoder-sweep-2.json").read_text())["rows"]
seeds = sorted({r["minimum_seed_pixels"] for r in sweep})
shade = dict(zip(seeds, ["#cfdcea", "#9fbadb", "#5f8fca", "#1d63b7", "#123f75"]))
fig, ax = plt.subplots(figsize=(8.6, 3.6))
for s in seeds:
    pts = [r for r in sweep if r["minimum_seed_pixels"] == s]
    ax.scatter([100 * r["recall"] for r in pts], [100 * r["precision"] for r in pts], s=30, color=shade[s], edgecolor="white", lw=0.6, label=f"{s} px", zorder=3)
chosen = next(r for r in sweep if (r["object_threshold"], r["boundary_threshold"], r["minimum_seed_pixels"]) == (0.5, 0.1, 60))
ax.scatter([100 * chosen["recall"]], [100 * chosen["precision"]], s=170, facecolor="none", edgecolor=INK, lw=1, zorder=4)
ax.annotate(f"Chosen: object 0.5, contact 0.1, seed 60 px\nrecall {100 * chosen['recall']:.1f}%, precision {100 * chosen['precision']:.1f}%",
            (100 * chosen["recall"], 100 * chosen["precision"]), xytext=(95.7, 85.0), fontsize=8.5, color=INK, ha="right", va="bottom",
            arrowprops={"arrowstyle": "-", "color": INK, "lw": 0.7, "shrinkB": 7})
ax.set_xlim(74, 96)
ax.set_ylim(84, 100)
for axis in (ax.xaxis, ax.yaxis):
    axis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
ax.set_xlabel("Instance recall")
ax.set_ylabel("Instance precision")
ax.legend(title="Smallest seed region", title_fontsize=8.5, loc="lower center", bbox_to_anchor=(0.5, 1.02), ncol=5, alignment="center")
grid(ax)
save(fig, "sweep")

# Figure 8: share of gates passed per validation round.
rounds = list(csv.DictReader((DATA / "gates-by-round.csv").open()))
x = list(range(len(rounds)))
fig, ax = plt.subplots(figsize=(8.6, 3.2))
for key, colour, name, fill, dy in (("learned_passed", BLUE, "Learned RGB-D segmenter", BLUE, 8), ("depth_passed", ORANGE, "Depth components (round-5 reference)", "white", -15)):
    y = [100 * int(r[key]) / int(r["gates"]) for r in rounds]
    ax.plot(x, y, "-o", color=colour, lw=1.8, ms=7, mfc=fill, mew=1.5, label=name)
    for i, r in enumerate(rounds):
        ax.annotate(f"{r[key]} of {r['gates']}", (i, y[i]), xytext=(0, dy), textcoords="offset points", ha="center", fontsize=8.5, color=colour)
ax.set_xticks(x, [f"Round {r['round']}\n{r['recordings']}" for r in rounds])
ax.set_xlim(-0.3, len(rounds) - 0.7)
ax.set_ylim(50, 106)
ax.set_yticks(range(50, 101, 10))
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
ax.set_ylabel("Gates passed")
ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.02), ncol=2)
grid(ax)
save(fig, "gates")
print("written:", ", ".join(sorted(p.name for p in OUT.glob("*.svg"))))
