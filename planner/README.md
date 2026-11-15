# ARES Mars Route Planner (v5)

Pick START and END on Mars, press **Find paths**, get **3 routes**: the best one (green) plus two alternatives, each explained.
One route is built per feature (shortest, least climb, flattest, smoothest, most clearance, least sand, lowest radiation, balanced); the best overall is picked by the score weights. Each map layer shows its heat map and the route built for that layer. Routes avoid hills and high ground (tunable).

## Layout

```
planner/
├── backend/            Python (FastAPI). Loads Mars heights, builds terrain layers, serves JSON.
│   ├── settings.py     terrain rules, crew/suit assumptions, route price styles
│   ├── terrain.py      DEM / sand-mask loading, demo terrain
│   ├── layers.py       slope, roughness, hillshade, danger, clearance + payload packing
│   ├── service.py      area choice, real-or-demo terrain, payload with timings
│   └── server.py       HTTP API + serves frontend/
├── frontend/           Static files. All path planning runs in the browser.
│   ├── index.html  config.js  style.css
│   ├── engine.js       path search, scoring, stage 1 (terrain) and stage 2 (oxygen/battery/radiation)
│   └── ui.js           the 7 pages and the map
├── tests/              test_backend.py (pytest), test_engine.js (node)
└── requirements.txt
```

## Run

```
pip install -r requirements.txt
uvicorn backend.server:app --port 8000        # run from the planner/ folder
```
Open http://localhost:8000. `ARES_FORCE_DEMO=1` skips the download and uses synthetic terrain (marked "DEMO — not Mars" in the app).

Tests: `ARES_FORCE_DEMO=1 pytest tests` and, with the server running, `node tests/test_engine.js`.

## For the backend team

| Endpoint | Returns |
|---|---|
| `GET /api/health` | `{"ok": true}` |
| `GET /api/payload` | payload for the default area (Gale crater, 3 km box) |
| `GET /api/load?slon&slat&elon&elat` | payload for a new area covering START and END (at least 8 km, at most 800 km wide) |

Payload (JSON): `H, W, px` (grid size, cell size in m), `area` (lat/lon box), `Z` (heights, base64 float64), `slope, rough, hill` (base64 float32), `sand` (base64 uint8), `hasSand, isDemo, label, sandLabel, notes`, `TR_SPEC, A_SPEC, PRESETS` (settings definitions), `tileUrls, tileMaxZoom` (NASA imagery), `timing` (`download, layers, pack` in seconds).
Arrays are row-major `H x W`, north at row 0.

Environment: `ARES_FORCE_DEMO`, `ARES_DEM_URL`, `ARES_DEM_FILE` (local Mars Trek GeoTIFF), `ARES_SAND_FILE`, `ARES_CORS` (comma-separated allowed origins, default `*`).

To change route rules or assumptions, edit `backend/settings.py` (defaults) and `frontend/engine.js` (search and scoring).

## For the frontend team

The frontend only needs `engine.js`, `ui.js`, `style.css` and a payload from `/api/payload`. To host it apart from the backend, set `window.ARES_API = 'https://your-backend'` in `frontend/config.js`.
`engine.js` also works in Node (`require('./frontend/engine.js')`), see `tests/test_engine.js`.

## Honest limits

- Real data is the USGS MOLA+HRSC blended DEM, 200 m per pixel. The map grid (about 19 m cells for a 3 km box) is finer than that, so small features are interpolated, not measured.
- If the download fails the backend falls back to DEMO terrain and every page says **DEMO — not Mars**.
- "Best" means the lowest score among the 8 candidate routes under the chosen weights. It is not a proven optimum.
- The radiation index is a proxy, radiation zones are hypothetical, and the crew/suit/oxygen/battery numbers are assumptions to confirm with the team.
- Tested on demo terrain only. The real USGS download and NASA imagery tiles have not been tested.
