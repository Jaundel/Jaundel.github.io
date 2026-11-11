Data and scripts behind "Giving physical space a memory"

Recorded phone session (Figures 1 and 2)
  phone_scene.py           Rebuilds one moment of runs/omni-demo-live (23 October 2026) in 3D: each phone's
                           LiDAR depth back-projected with its intrinsics, placed by its calibrated pose,
                           coloured from its own camera and cropped to the work area; rendered from a
                           moving virtual camera. Writes media/scene/fused-orbit.webm and scene.json.
  phone_segmentation.py    Runs Omni's live single-camera perception (tools/phone_demo.py, detected) with
                           configs/tabletop-phone-learned.json on the same session and draws the accepted
                           masks. Figure 2 is frame 9 of "phone_segmentation.py 48 phone2 --all", 75.7 s
                           into the session; phone_segmentation.json records the run.

Model outputs and dataset frames (Figures 3, 6, 7, 9, 10)
  segmenter_panels.py      Runs the released segmenter (assets/models/omni-segmenter-v1.onnx), the
                           HO-Cap-only model and the embedding model on HO-Cap and OCID frames from the
                           Omni repository's training caches, and writes media/seg/. Frames are drawn at
                           random with fixed seeds (Figure 6 from recordings that passed every gate);
                           images are cropped and overlaid, nothing else.
  panels.json              What segmenter_panels.py chose and measured: recording, camera, frame, crop,
                           matched objects, and the per-frame OCID overlap and boundary measures.
  grids.py                 Writes the image grids into index.html from panels.json.

Data charts (Figures 4, 5, 8), plotted with matplotlib
  plot_charts.py           Plots the three charts from the files below and writes media/charts/*.svg;
                           text is Poppins (fonts/, SIL Open Font License) converted to outlines.
  data/train-run-a-log.jsonl, data/train-run-b-log.json
                           Training logs of the two boundary-target runs (runs/segmenter/dev-a, dev-b).
  data/decoder-sweep-1.json, data/decoder-sweep-2.json
                           The decoder settings sweep on 240 held-out views (runs/segmenter/dev-b).
  data/gates-by-round.csv  Gates passed in validation rounds 6 to 8, with the result file for each row.

All scripts except plot_charts.py and grids.py run with the Omni phone environment from the Omni
repository root (PYTHONPATH=.).
