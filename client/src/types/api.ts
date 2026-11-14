/**
 * TypeScript API interfaces matching ARES-Gale FastAPI backend schemas
 */

export interface Waypoint {
  lat: number;
  lng: number;
  name?: string;
  elevation_m?: number;
}

export interface RouteRequest {
  start: Waypoint;
  destination: Waypoint;
  mode: 'safe' | 'direct';
  max_slope_deg?: number;
}

export interface ElevationPoint {
  distance_km: number;
  elevation_m: number;
  slope_deg: number;
}

export interface TraversedGeology {
  unit: string;
  percent: number;
}

export interface RouteSummary {
  total_distance_km: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  max_slope_deg: number;
  avg_slope_deg: number;
  estimated_eva_time_hours: number;
  hazard_level: 'NOMINAL_SAFE' | 'ELEVATED_CAUTION' | 'HAZARDOUS';
}

export interface RouteResponse {
  status: string;
  metadata: {
    algorithm: string;
    dem_source: string;
    grid_resolution_m: number;
    cells_explored?: number;
    timestamp?: string;
  };
  summary: RouteSummary;
  route_coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  elevation_profile: ElevationPoint[];
  traversed_geology: TraversedGeology[];
}

export interface REMSData {
  sol: number;
  air_temp_c: number;
  ground_temp_c: number;
  pressure_pa: number;
  wind_speed_ms: number;
  uv_index: string;
  diurnal_min_c: number;
  diurnal_max_c: number;
  humidity_relative_percent?: number;
}

export interface RADData {
  dose_rate_mSv_day: number;
  dose_rate_uSv_hour?: number;
  cumulative_eva_allowed_hours: number;
  solar_particle_event_alert: boolean;
  status: string;
  shielding_recommendation?: string;
}

export interface TelemetryResponse {
  status: string;
  location: string;
  sol: number;
  rems: REMSData;
  rad: RADData;
  disclaimer: string;
}

export interface MissionWaypoint {
  id: string;
  name: string;
  type: 'base_station' | 'scientific_target' | 'hazard_checkpoint';
  lat: number;
  lng: number;
  elevation_m: number;
  description: string;
}
