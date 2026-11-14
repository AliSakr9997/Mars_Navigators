# ARES-Gale: Mars Exploration & Mission Planning System
### NASA Space Apps Challenge 2026 | Challenge: Interplanetary Survival Guide: Martian Map

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_TypeScript-61DAFB.svg?style=flat&logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Mapping-Leaflet-199900.svg?style=flat&logo=leaflet)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ARES-Gale** (*Astronaut Route & Environmental Surface planner – Gale Crater*) is an interactive mission planning HUD and terrain-aware navigation engine designed for astronaut surface EVAs (Extravehicular Activities) on Mars.

Targeted at the scientifically rich **Boxwork formations on lower Mount Sharp (Aeolis Mons)** inside Gale Crater, the system fuses high-resolution NASA orbital datasets (MOLA/HRSC elevation, HiRISE/CTX optical imagery, CRISM spectral data) with in-situ rover environmental telemetry (MSL Curiosity REMS and RAD) to compute optimal, slope-constrained traverses for exploration.

---

## 1. System Architecture

```text
Mars_Navigators/
├── client/                     # [Member 1] React + Vite + TypeScript + Tailwind + Leaflet
│   ├── public/                 # Static basemaps, textures, NASA badges
│   └── src/
│       ├── components/         # HUD, MapContainer, LayerControl, ElevationChart
│       ├── types/              # TypeScript interface contracts matching backend
│       └── utils/              # Client-side fallback pathfinder
├── server/                     # [Member 4 & 5] Python FastAPI Backend & Router
│   ├── data/                   # [Member 2 & 3] Preprocessed DEM grid & GeoJSON
│   ├── router/                 # [Member 4] A* Pathfinding & Slope hazard engine
│   ├── main.py                 # [Member 5] FastAPI App & CORS endpoints
│   ├── schemas.py              # Pydantic data models
│   └── requirements.txt
├── datasets/                   # [Member 2 & 3] Raw & Processed NASA Sources
│   ├── dem/                    # MOLA / HRSC elevation grids
│   ├── geology/                # CRISM & USGS geological unit GeoJSON
│   └── telemetry/              # Curiosity REMS & RAD in-situ observations
└── docs/                       # Mission briefing & scientific documentation
```

---

## 2. Team Roles & Workstreams

- **Member 1 (Frontend):** Astronaut HUD, mission dashboard, layer controls, and elevation profile charts.
- **Member 2 (GIS & Cartography):** Gale Crater bounding box extraction, calibrated basemap PNG overlays, and coordinate alignment.
- **Member 3 (NASA Data):** Curating CRISM/USGS geological GeoJSON, MSL Curiosity REMS/RAD telemetry, and NASA attributions.
- **Member 4 (Algorithms):** 2D A* pathfinding on DEM elevation grid with slope penalization and traverse safety metrics.
- **Member 5 (Backend & Deployment - Lead):** FastAPI backend, API schemas, integration testing, Docker/cloud deployment.

---

## 3. Quickstart & Local Setup

### Backend (Python 3.10+)
```bash
cd server
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Frontend (Node 18+)
```bash
cd client
npm install
npm run dev
```
- UI Dashboard: `http://localhost:5173`

---

## 4. API Endpoints

- `GET /api/health`: System status and mission parameters.
- `GET /api/telemetry`: MSL Curiosity in-situ REMS & RAD environmental telemetry.
- `GET /api/layers/geology`: Gale Crater geological units (Clay, Sulfate, Boxwork, Dunes) as GeoJSON.
- `GET /api/layers/waypoints`: Preset scientific waypoints in Gale Crater.
- `POST /api/route/plan`: Generates terrain-aware A* route, elevation profile, and hazard metrics.

---

## 5. NASA Data Attribution & Disclaimer

- **HRSC & MOLA:** Mars Express & Mars Global Surveyor elevation models (ESA / NASA).
- **HiRISE & CTX:** Mars Reconnaissance Orbiter optical surface mosaics (NASA / JPL / University of Arizona).
- **CRISM & USGS:** Compact Reconnaissance Imaging Spectrometer & USGS Planetary Geologic Mapping Program.
- **REMS & RAD:** Mars Science Laboratory Curiosity Rover (NASA / JPL-Caltech / CAB / SwRI).

> **Scientific Integrity Disclaimer:** In-situ REMS and RAD data represent point measurements taken by the Curiosity rover on Mount Sharp, not continuous regional spatial grids. Prototype route difficulty scores are algorithmic terrain models, not certified flight safety guarantees.
