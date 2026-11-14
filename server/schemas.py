from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Waypoint(BaseModel):
    lat: float = Field(..., description="Latitude in Mars decimal degrees (e.g. -4.6620)")
    lng: float = Field(..., description="Longitude in Mars decimal degrees (e.g. 137.4120)")
    name: Optional[str] = Field(None, description="Human readable landmark name")
    elevation_m: Optional[float] = Field(None, description="Elevation in meters")

class RouteRequest(BaseModel):
    start: Waypoint
    destination: Waypoint
    mode: str = Field("safe", description="Routing mode/profile: 'safe', 'direct', 'min_slope', 'energy_saver', 'balanced'")
    algorithm: Optional[str] = Field("A* + any-angle smoothing", description="Algorithm: 'A*', 'Dijkstra', 'Weighted A* (ε=2.5)', 'Greedy best-first', 'A* + any-angle smoothing'")
    max_slope_deg: float = Field(25.0, description="Maximum allowable slope in degrees before impassable")

class ElevationPoint(BaseModel):
    distance_km: float
    elevation_m: float
    slope_deg: float

class TraversedGeology(BaseModel):
    unit: str
    percent: float

class RouteSummary(BaseModel):
    total_distance_km: float
    length_m: Optional[float] = None
    elevation_gain_m: float
    elevation_loss_m: float
    max_slope_deg: float
    avg_slope_deg: float
    time_min: Optional[float] = None
    estimated_eva_time_hours: float
    energy_kj: Optional[float] = None
    risk_score: Optional[float] = None
    min_clear_m: Optional[float] = None
    hazard_level: str
    hazard_hits: Optional[int] = 0

class RouteResponse(BaseModel):
    status: str
    metadata: Dict[str, Any]
    summary: RouteSummary
    route_coordinates: List[List[float]]
    elevation_profile: List[ElevationPoint]
    traversed_geology: List[TraversedGeology]

class CandidateRoute(BaseModel):
    rank: int
    profile: str
    algorithm: str
    total_distance_km: float
    time_min: float
    estimated_eva_time_hours: float
    energy_kj: float
    risk_score: float
    max_slope_deg: float
    avg_slope_deg: float
    min_clear_m: float
    composite_score: float
    feasible: bool
    compute_time_s: float
    expanded_nodes: int

class MultiRouteRequest(BaseModel):
    start: Waypoint
    destination: Waypoint
    algorithms: Optional[List[str]] = Field(
        default=["Dijkstra", "A*", "Weighted A* (ε=2.5)", "A* + any-angle smoothing"],
        description="Pathfinding models to run and compare"
    )
    profiles: Optional[List[str]] = Field(
        default=["Shortest distance", "Min slope", "Safest (max clearance)", "Energy saver", "Balanced"],
        description="Cost surface profiles to evaluate"
    )
    priority: str = Field(
        default="Balanced",
        description="Mission priority for candidate ranking: 'Safety first', 'Speed first', 'Energy / O2 first', 'Balanced'"
    )
    custom_weights: Optional[Dict[str, float]] = None

class MultiRouteResponse(BaseModel):
    status: str
    priority: str
    best_candidate: CandidateRoute
    best_route: RouteResponse
    candidates: List[CandidateRoute]
    total_evaluated: int

class REMSData(BaseModel):
    sol: int
    air_temp_c: float
    ground_temp_c: float
    pressure_pa: float
    wind_speed_ms: float
    uv_index: str
    diurnal_min_c: float
    diurnal_max_c: float
    humidity_relative_percent: Optional[float] = None

class RADData(BaseModel):
    dose_rate_mSv_day: float
    cumulative_eva_allowed_hours: float
    solar_particle_event_alert: bool
    status: str
    shielding_recommendation: Optional[str] = None

class TelemetryResponse(BaseModel):
    status: str
    location: str
    sol: int
    rems: REMSData
    rad: RADData
    disclaimer: str
