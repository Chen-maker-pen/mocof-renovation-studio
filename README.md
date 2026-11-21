# MOCOF Renovation Studio — Portfolio Edition

An interactive home renovation planner by **Chit Naing**. Draw rooms and partitions, place fixed-size furniture, inspect your layout in 2D or a navigable 3D studio, and export a structured item list for quotation review.

This repository is a public sample-data edition of a larger local prototype. It contains original schematic samples, not private customer projects, supplier catalogs or company Drive photographs.

## Features

- Guided floor-plan → style → furnish → review workflow.
- 15 editable sample templates: six furnished rooms, six room outlines and three whole-house concepts.
- 20 planning symbols: beds, sofas, desks, cabinets, kitchen and bathroom fittings.
- Draw partitions and named rooms; add doors and windows to outer boundaries or partitions.
- Multiple non-overlapping wall openings shared between the 2D and 3D models.
- Drag furniture to place/move it, rotate through handles or angle controls, and delete with undo/redo.
- Fixed furniture dimensions; sample dimensions are explicitly illustrative.
- Three.js orbit, inside view, room navigation and automatic rotation.
- Distance/area measurements, reference-image calibration, annotations and grouping/alignment.
- SVG and editable JSON export, wall-measurement CSV import and quotation-readiness checks.
- Per-visitor browser project saving in the hosted demo; SQLite version storage when running locally.
- Optional Python AI editing endpoint with proposal review, geometry validation and fixed-size safeguards. **Live AI is disabled in the public demo.**

## Stack

Vanilla JavaScript · SVG · Three.js · Python standard library · SQLite · Vercel Python Functions

The frontend and 3D viewer share one metre-based project model. The backend validates room boundaries, opening overlap and furniture sizes. Quotations remain review flags and structured item data; no supplier prices are invented.

## Run locally

```sh
python3 server.py
```

Open `http://127.0.0.1:8765`. No Python packages are required. Python 3.12 is recommended for consistency with the hosted runtime.

```sh
python3 -m unittest discover -p 'test_*.py'
```

PDF reference import additionally requires Poppler's `pdftoppm` locally. The hosted demo accepts PNG, JPEG and WebP reference images.

## Deploy to Vercel

Import this repository into Vercel. Use **Other** as the framework preset, leave the build command empty, and retain the checked-in `vercel.json`. The output directory is `static`; `api/index.py` serves the sample catalog and quotation-validation API.

The hosted API keeps only a disposable sample catalog in `/tmp`. Project JSON is stored in each visitor's `localStorage`, not in a shared server database. Production use would require authenticated accounts, durable storage, approved supplier pricing and server-side project ownership controls.

## Portfolio description

> Built an interactive 2D/3D renovation planner using JavaScript, SVG, Three.js and Python, with editable room geometry, fixed-size furniture placement, door/window modelling, undo/redo, project persistence and validated quotation handoffs.

This is a prototype/portfolio demonstration, not a production pricing or architectural certification service. MOCOF branding identifies the original project context; this public demo uses original sample assets.

## Third-party code

Three.js and OrbitControls are distributed under the MIT license. See `static/vendor/LICENSE` and `THIRD_PARTY_NOTICES.md`.
