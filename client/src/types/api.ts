/**
 * TypeScript API interfaces matching ARES-Gale NASA Mars Mission Console
 */

export interface Waypoint {
  lat: number;
  lng: number;
  name?: string;
  elevation_m?: number;
}

export type TransportMode = 'walking' | 'rover';

export interface RouteRequest {
  start: Waypoint;
  destination: Waypoint;
  mode: string; // 'Balanced' | 'Safest (max clearance)' | 'Min slope' | 'Energy saver' | 'Shortest distance' | 'Custom'
  algorithm?: string; // 'A* + any-angle smoothing' | 'A*' | 'Dijkstra' | 'Weighted A* (ε=2.5)' | 'Greedy best-first'
  max_slope_deg?: number;
  transportMode?: TransportMode;
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

export interface PointOfNoReturn {
  km: number;
  safe: boolean;
  limitingFactor: 'Oxygen' | 'Battery' | 'Thermal' | 'Nominal';
  returnTimeMin: number;
}

export interface RouteOption {
  id: 'P1' | 'P2' | 'P3' | string;
  name: string;
  feature: string;
  color: string;
  why: string;
  summary: RouteSummary;
  route_coordinates: [number, number][];
  elevation_profile: ElevationPoint[];
}

export interface RouteSummary {
  total_distance_km: number;
  length_m?: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  max_slope_deg: number;
  avg_slope_deg: number;
  time_min?: number;
  estimated_eva_time_hours: number;
  energy_kj?: number;
  energy_kcal?: number;
  oxygen_consumed_liters?: number;
  battery_kwh_consumed?: number;
  rover_battery_kwh_consumed?: number;
  transportMode?: TransportMode;
  risk_score?: number;
  min_clear_m?: number;
  hazard_level: string;
  hazard_hits?: number;
}

export interface RouteResponse {
  status: string;
  metadata: {
    algorithm: string;
    profile?: string;
    transportMode?: TransportMode;
    dem_source: string;
    grid_resolution_m: number;
    cells_explored?: number;
    expanded_nodes?: number;
    compute_time_s?: number;
    timestamp?: string;
  };
  summary: RouteSummary;
  route_coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  elevation_profile: ElevationPoint[];
  traversed_geology: TraversedGeology[];
  options?: RouteOption[];
  activeOptionId?: string;
  pnr?: PointOfNoReturn;
}

export interface CandidateRoute {
  rank: number;
  profile: string;
  algorithm: string;
  total_distance_km: number;
  time_min: number;
  estimated_eva_time_hours: number;
  energy_kj: number;
  risk_score: number;
  max_slope_deg: number;
  avg_slope_deg: number;
  min_clear_m: number;
  composite_score: number;
  feasible: boolean;
  compute_time_s: number;
  expanded_nodes: number;
}

export interface MultiRouteRequest {
  start: Waypoint;
  destination: Waypoint;
  algorithms?: string[];
  profiles?: string[];
  priority?: string; // 'Safety first' | 'Speed first' | 'Energy / O2 first' | 'Balanced'
  custom_weights?: Record<string, number>;
  transportMode?: TransportMode;
}

export interface MultiRouteResponse {
  status: string;
  priority: string;
  best_candidate: CandidateRoute;
  best_route: RouteResponse;
  candidates: CandidateRoute[];
  total_evaluated: number;
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

export interface TerrainStats {
  source: string;
  grid_shape: [number, number];
  pixel_resolution_m: number;
  hazard_coverage_percent: number;
  elevation_m: {
    min: number;
    max: number;
    mean: number;
  };
  slope_deg: {
    p50: number;
    p95: number;
    max: number;
  };
}
