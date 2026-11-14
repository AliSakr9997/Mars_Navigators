import os
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import (
    RouteRequest, RouteResponse, TelemetryResponse, 
    REMSData, RADData, Waypoint
)
from router.pathfinder import pathfinder

# Initialize FastAPI App
app = FastAPI(
    title="ARES-Gale: Mars Exploration & Mission Planning API",
    description="Backend services for terrain-aware route planning, NASA in-situ telemetry, and geological spatial data on Mars (Gale Crater / Mount Sharp / Boxwork).",
    version="1.0.0"
)

# Enable CORS for all origins during hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json_file(filename: str) -> Dict[str, Any]:
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Data file '{filename}' not found."
        )
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/", tags=["System"])
def root_status():
    return {
        "mission": "ARES-Gale",
        "description": "Mars Exploration & Mission Planning System - Gale Crater",
        "status": "ONLINE",
        "api_docs": "/docs",
        "endpoints": [
            "/api/health",
            "/api/telemetry",
            "/api/layers/geology",
            "/api/layers/waypoints",
            "/api/route/plan"
        ]
    }

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "nominal",
        "mission": "ARES-Gale",
        "target": "Gale Crater - Lower Mount Sharp - Boxwork Formations",
        "coordinates": {
            "min_lat": -4.78, "max_lat": -4.60,
            "min_lon": 137.35, "max_lon": 137.55
        },
        "pathfinder_grid_ready": True
    }

@app.get("/api/telemetry", response_model=TelemetryResponse, tags=["NASA Data"])
def get_curiosity_telemetry():
    """Returns MSL Curiosity in-situ environmental measurements (REMS & RAD)."""
    data = load_json_file("telemetry.json")
    return data

@app.get("/api/layers/geology", tags=["NASA Data"])
def get_geology_layers():
    """Returns Gale Crater Boxwork GeoJSON features (USGS & CRISM layers)."""
    geojson_data = load_json_file("geology_units.json")
    return geojson_data

@app.get("/api/layers/waypoints", tags=["NASA Data"])
def get_mission_waypoints():
    """Returns preset mission exploration waypoints inside Gale Crater."""
    waypoints = load_json_file("waypoints.json")
    return waypoints

@app.post("/api/route/plan", response_model=RouteResponse, tags=["Navigation"])
def plan_mission_route(request: RouteRequest):
    """
    Computes an optimal, slope-constrained surface EVA traverse on Mars.
    Fuses MOLA/HRSC elevation, slope penalties, and terrain hazard weights.
    """
    try:
        result = pathfinder.plan_route(
            start_lat=request.start.lat,
            start_lon=request.start.lng,
            dest_lat=request.destination.lat,
            dest_lon=request.destination.lng,
            mode=request.mode.lower(),
            max_slope_deg=request.max_slope_deg
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route planning failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
