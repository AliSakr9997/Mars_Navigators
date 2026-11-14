import os
import json
from typing import Dict, Any, List, Tuple
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import (
    RouteRequest, RouteResponse, RouteSummary, ElevationPoint, TraversedGeology,
    MultiRouteRequest, MultiRouteResponse, CandidateRoute,
    TelemetryResponse, REMSData, RADData, Waypoint
)
from router.planner_engine import (
    terrain, solve_route, rank_candidates,
    PROFILES, ALGOS, PRIORITIES, MarsTerrain
)

# Initialize FastAPI App
app = FastAPI(
    title="ARES-Gale: Mars Exploration & Mission Planning API",
    description="Multi-algorithm terrain-aware route planner, NASA scientific data layers, and in-situ environmental telemetry on Mars.",
    version="2.0.0"
)

# Enable CORS for all origins during development
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
        "version": "2.0.0",
        "status": "ONLINE",
        "api_docs": "/docs",
        "endpoints": [
            "/api/health",
            "/api/telemetry",
            "/api/layers/geology",
            "/api/layers/waypoints",
            "/api/terrain/profiles",
            "/api/terrain/stats",
            "/api/route/plan",
            "/api/route/analyze"
        ]
    }

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "nominal",
        "mission": "ARES-Gale",
        "target": "Gale Crater - Mount Sharp - Boxwork Formations",
        "terrain_grid": f"{terrain.H}x{terrain.W}",
        "resolution_m_px": round(terrain.px, 2),
        "supported_algorithms": list(ALGOS.keys()),
        "supported_profiles": list(PROFILES.keys()),
        "supported_priorities": list(PRIORITIES.keys())
    }

@app.get("/api/telemetry", response_model=TelemetryResponse, tags=["NASA Data"])
def get_curiosity_telemetry():
    """Returns MSL Curiosity in-situ environmental measurements (REMS & RAD)."""
    return load_json_file("telemetry.json")

@app.get("/api/layers/geology", tags=["NASA Data"])
def get_geology_layers():
    """Returns Gale Crater Boxwork GeoJSON features (USGS & CRISM layers)."""
    return load_json_file("geology_units.json")

@app.get("/api/layers/waypoints", tags=["NASA Data"])
def get_mission_waypoints():
    """Returns preset mission exploration waypoints inside Gale Crater."""
    return load_json_file("waypoints.json")

@app.get("/api/terrain/profiles", tags=["Navigation"])
def get_terrain_profiles():
    """Returns available pathfinding algorithms, cost surface profiles, and mission priorities."""
    return {
        "algorithms": list(ALGOS.keys()),
        "profiles": PROFILES,
        "priorities": PRIORITIES
    }

@app.get("/api/terrain/stats", tags=["Navigation"])
def get_terrain_stats():
    """Returns spatial statistics for the active Mars terrain model."""
    import numpy as np
    return {
        "source": terrain.source,
        "grid_shape": [terrain.H, terrain.W],
        "pixel_resolution_m": round(terrain.px, 2),
        "hazard_coverage_percent": round(float(terrain.hazard.mean() * 100.0), 1),
        "elevation_m": {
            "min": round(float(terrain.Z.min()), 1),
            "max": round(float(terrain.Z.max()), 1),
            "mean": round(float(terrain.Z.mean()), 1)
        },
        "slope_deg": {
            "p50": round(float(np.percentile(terrain.slope, 50)), 1),
            "p95": round(float(np.percentile(terrain.slope, 95)), 1),
            "max": round(float(terrain.slope.max()), 1)
        }
    }

def _resolve_profile(mode: str, custom_weights: Dict[str, float] = None) -> Tuple[str, Dict[str, float]]:
    mode_lower = mode.lower()
    if custom_weights:
        return "Custom", custom_weights
    elif "direct" in mode_lower or "shortest" in mode_lower:
        return "Shortest distance", PROFILES["Shortest distance"]
    elif "slope" in mode_lower:
        return "Min slope", PROFILES["Min slope"]
    elif "energy" in mode_lower:
        return "Energy saver", PROFILES["Energy saver"]
    elif "safe" in mode_lower:
        return "Safest (max clearance)", PROFILES["Safest (max clearance)"]
    else:
        return "Balanced", PROFILES["Balanced"]

@app.post("/api/route/plan", response_model=RouteResponse, tags=["Navigation"])
def plan_mission_route(request: RouteRequest):
    """
    Computes an optimal, terrain-aware surface EVA traverse on Mars.
    Supports switchable algorithms (A*, Dijkstra, Any-Angle smoothing) and cost profiles.
    """
    try:
        prof_name, prof_weights = _resolve_profile(request.mode)
        algo_name = request.algorithm if request.algorithm in ALGOS else "A* + any-angle smoothing"
        
        start_grid = terrain.lonlat_to_grid(request.start.lng, request.start.lat)
        dest_grid = terrain.lonlat_to_grid(request.destination.lng, request.destination.lat)
        
        res = solve_route(terrain, start_grid, dest_grid, algo_name, prof_name, prof_weights)
        if not res:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No feasible path found between points. Start or destination may be enclosed by severe hazards."
            )
            
        summary = RouteSummary(
            total_distance_km=res["total_distance_km"],
            length_m=res["length_m"],
            elevation_gain_m=res["climb_m"],
            elevation_loss_m=res["descent_m"],
            max_slope_deg=res["max_slope_deg"],
            avg_slope_deg=res["avg_slope_deg"],
            time_min=res["time_min"],
            estimated_eva_time_hours=res["estimated_eva_time_hours"],
            energy_kj=res["energy_kj"],
            risk_score=res["risk_score"],
            min_clear_m=res["min_clear_m"],
            hazard_level=res["hazard_level"],
            hazard_hits=res["hazard_hits"]
        )
        
        traversed_geology = [
            TraversedGeology(unit="Lower Clay-bearing Unit", percent=35.0),
            TraversedGeology(unit="Sulfate-bearing Strata", percent=45.0),
            TraversedGeology(unit="Boxwork Ridge Formations", percent=20.0)
        ]
        
        elevation_profile = [ElevationPoint(**pt) for pt in res["elevation_profile"]]
        
        return RouteResponse(
            status="success",
            metadata={
                "algorithm": res["algorithm"],
                "profile": res["profile"],
                "dem_source": terrain.source,
                "grid_resolution_m": round(terrain.px, 2),
                "expanded_nodes": res["expanded_nodes"],
                "compute_time_s": res["compute_time_s"]
            },
            summary=summary,
            route_coordinates=res["route_coordinates"],
            elevation_profile=elevation_profile,
            traversed_geology=traversed_geology
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route planning failed: {str(e)}"
        )

@app.post("/api/route/analyze", response_model=MultiRouteResponse, tags=["Navigation"])
def analyze_multi_candidate_routes(request: MultiRouteRequest):
    """
    Evaluates multiple pathfinding models and cost profiles simultaneously.
    Ranks every candidate route by human factors (Risk, Time, Energy, Length)
    and mission priority to recommend the winning route.
    """
    try:
        start_grid = terrain.lonlat_to_grid(request.start.lng, request.start.lat)
        dest_grid = terrain.lonlat_to_grid(request.destination.lng, request.destination.lat)
        
        candidate_results = []
        
        requested_profiles = request.profiles or list(PROFILES.keys())
        requested_algos = request.algorithms or ["Dijkstra", "A*", "Weighted A* (ε=2.5)", "A* + any-angle smoothing"]
        
        for prof_name in requested_profiles:
            weights = request.custom_weights if prof_name == "Custom" and request.custom_weights else PROFILES.get(prof_name, PROFILES["Balanced"])
            for algo_name in requested_algos:
                r = solve_route(terrain, start_grid, dest_grid, algo_name, prof_name, weights)
                if r:
                    candidate_results.append(r)
                    
        if not candidate_results:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No candidate routes found under given constraints."
            )
            
        ranked = rank_candidates(candidate_results, request.priority)
        best = ranked[0]
        
        best_candidate = CandidateRoute(
            rank=best["rank"],
            profile=best["profile"],
            algorithm=best["algorithm"],
            total_distance_km=best["total_distance_km"],
            time_min=best["time_min"],
            estimated_eva_time_hours=best["estimated_eva_time_hours"],
            energy_kj=best["energy_kj"],
            risk_score=best["risk_score"],
            max_slope_deg=best["max_slope_deg"],
            avg_slope_deg=best["avg_slope_deg"],
            min_clear_m=best["min_clear_m"],
            composite_score=best["composite_score"],
            feasible=best["feasible"],
            compute_time_s=best["compute_time_s"],
            expanded_nodes=best["expanded_nodes"]
        )
        
        all_candidates = [
            CandidateRoute(
                rank=c["rank"],
                profile=c["profile"],
                algorithm=c["algorithm"],
                total_distance_km=c["total_distance_km"],
                time_min=c["time_min"],
                estimated_eva_time_hours=c["estimated_eva_time_hours"],
                energy_kj=c["energy_kj"],
                risk_score=c["risk_score"],
                max_slope_deg=c["max_slope_deg"],
                avg_slope_deg=c["avg_slope_deg"],
                min_clear_m=c["min_clear_m"],
                composite_score=c["composite_score"],
                feasible=c["feasible"],
                compute_time_s=c["compute_time_s"],
                expanded_nodes=c["expanded_nodes"]
            )
            for c in ranked
        ]
        
        best_summary = RouteSummary(
            total_distance_km=best["total_distance_km"],
            length_m=best["length_m"],
            elevation_gain_m=best["climb_m"],
            elevation_loss_m=best["descent_m"],
            max_slope_deg=best["max_slope_deg"],
            avg_slope_deg=best["avg_slope_deg"],
            time_min=best["time_min"],
            estimated_eva_time_hours=best["estimated_eva_time_hours"],
            energy_kj=best["energy_kj"],
            risk_score=best["risk_score"],
            min_clear_m=best["min_clear_m"],
            hazard_level=best["hazard_level"],
            hazard_hits=best["hazard_hits"]
        )
        
        best_elevation_profile = [ElevationPoint(**pt) for pt in best["elevation_profile"]]
        
        best_route = RouteResponse(
            status="success",
            metadata={
                "algorithm": best["algorithm"],
                "profile": best["profile"],
                "dem_source": terrain.source,
                "grid_resolution_m": round(terrain.px, 2),
                "expanded_nodes": best["expanded_nodes"],
                "compute_time_s": best["compute_time_s"]
            },
            summary=best_summary,
            route_coordinates=best["route_coordinates"],
            elevation_profile=best_elevation_profile,
            traversed_geology=[
                TraversedGeology(unit="Lower Clay-bearing Unit", percent=35.0),
                TraversedGeology(unit="Sulfate-bearing Strata", percent=45.0),
                TraversedGeology(unit="Boxwork Ridge Formations", percent=20.0)
            ]
        )
        
        return MultiRouteResponse(
            status="success",
            priority=request.priority,
            best_candidate=best_candidate,
            best_route=best_route,
            candidates=all_candidates,
            total_evaluated=len(all_candidates)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-route analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
