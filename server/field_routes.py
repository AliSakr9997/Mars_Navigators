"""Map schematic field coordinates onto the mission's simulated terrain grid."""
from copy import copy
from typing import Annotated

import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from router.planner_engine import terrain, solve_route, PROFILES

router = APIRouter()
Fraction = Annotated[float, Field(ge=0, le=1)]

class Traverse(BaseModel):
    start: tuple[Fraction, Fraction]
    end: tuple[Fraction, Fraction]
    max_slope: float = Field(default=20, ge=2, le=45)
    mode: str = "Balanced"

@router.post("/api/field/traverse")
def traverse(query: Traverse):
    if query.mode not in PROFILES:
        raise HTTPException(422, "Unknown route profile")
    model = copy(terrain)
    model.hazard = terrain.hazard | (terrain.slope > query.max_slope)
    model._cost_cache = {}
    def cell(point):
        return round(point[1]*(model.H-1)), round(point[0]*(model.W-1))
    start, end = cell(query.start), cell(query.end)
    if start == end or model.hazard[start] or model.hazard[end]:
        raise HTTPException(422, "No feasible route at these endpoints and slope limit")
    result = solve_route(model, start, end, "A*", query.mode, PROFILES[query.mode])
    if result is None:
        raise HTTPException(422, "No feasible route")
    cells = [model.lonlat_to_grid(lon, lat) for lat, lon in result["route_coordinates"]]
    rows, cols = np.array(cells).T
    km = np.r_[0, np.cumsum(np.hypot(np.diff(rows), np.diff(cols)) * model.px / 1000)]
    risk = round(result["risk_score"] * 100)
    return dict(pts=[[c/(model.W-1),r/(model.H-1)] for r,c in cells],
                km=km.tolist(), heights=model.Z[rows,cols].tolist(), sl=model.slope[rows,cols].tolist(),
                d=float(km[-1]), peak=result["max_slope_deg"], avg=result["avg_slope_deg"],
                rise=result["climb_m"], loss=result["descent_m"], h=result["hazard_hits"], risk=risk,
                score=100-risk, cl="High Risk" if risk>=50 else "Caution" if risk>=25 else "Safe",
                time=round(result["time_min"]), terrain=model.source)
