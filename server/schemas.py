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
    mode: str = Field("safe", description="Routing mode: 'safe' (slope minimized) or 'direct' (distance minimized)")
    max_slope_deg: float = Field(15.0, description="Maximum allowable slope in degrees before impassable")

class ElevationPoint(BaseModel):
    distance_km: float
    elevation_m: float
    slope_deg: float

class TraversedGeology(BaseModel):
    unit: str
    percent: float

class RouteSummary(BaseModel):
    total_distance_km: float
    elevation_gain_m: float
    elevation_loss_m: float
    max_slope_deg: float
    avg_slope_deg: float
    estimated_eva_time_hours: float
    hazard_level: str

class RouteResponse(BaseModel):
    status: str
    metadata: Dict[str, Any]
    summary: RouteSummary
    route_coordinates: List[List[float]]
    elevation_profile: List[ElevationPoint]
    traversed_geology: List[TraversedGeology]

class REMSData(BaseModel):
    sol: int
    air_temp_c: float
    ground_temp_c: float
    pressure_pa: float
    wind_speed_ms: float
    uv_index: str
    diurnal_min_c: float
    diurnal_max_c: float

class RADData(BaseModel):
    dose_rate_mSv_day: float
    cumulative_eva_allowed_hours: float
    solar_particle_event_alert: bool
    status: str

class TelemetryResponse(BaseModel):
    status: str
    location: str
    sol: int
    rems: REMSData
    rad: RADData
    disclaimer: str
