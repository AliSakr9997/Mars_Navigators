"""HTTP API + static frontend.   Run from the planner/ folder:   uvicorn backend.server:app --port 8000

GET /api/health                     -> {"ok": true}
GET /api/payload                    -> payload for the default area (Gale crater, 3 km)
GET /api/load?slon&slat&elon&elat   -> payload for a new area that covers START (slon, slat) and END (elon, elat)
GET /                               -> the frontend (planner/frontend)

The payload is plain JSON (see README). Heights and layers are base64 arrays; all path planning runs in the browser.
"""
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from . import service

app = FastAPI(title="ARES Mars Route Planner")
app.add_middleware(GZipMiddleware, minimum_size=2000)
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get("ARES_CORS", "*").split(","), allow_methods=["GET"], allow_headers=["*"])


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/payload")
def payload():
    return service.default_payload()


@app.get("/api/load")
def load(slon: float, slat: float, elon: float, elat: float):
    if not (-180 <= slon <= 360 and -180 <= elon <= 360 and -90 <= slat <= 90 and -90 <= elat <= 90):
        raise HTTPException(status_code=422, detail="lat must be -90..90 and lon -180..360")
    try:
        return service.payload_for_points(slon, slat, elon, elat)
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"{type(ex).__name__}: {str(ex)[:300]}")


_FRONT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
app.mount("/", StaticFiles(directory=_FRONT, html=True), name="frontend")
