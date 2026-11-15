import { RouteRequest, RouteResponse } from '../types/api';

/**
 * Offline fallback route planner for frontend development and offline demos
 */
export function generateMockRoute(request: RouteRequest): RouteResponse {
  const { start, destination, mode, algorithm = "A* + any-angle smoothing" } = request;
  const numSteps = 45;
  const route_coordinates: [number, number][] = [];
  const elevation_profile = [];

  const startLat = start.lat;
  const startLng = start.lng;
  const endLat = destination.lat;
  const endLng = destination.lng;

  // Approximate distance in km on Mars (59.16 km / degree)
  const dLat = (endLat - startLat) * 59.16;
  const dLng = (endLng - startLng) * 58.96;
  const directDistanceKm = Math.sqrt(dLat * dLat + dLng * dLng);
  const isDirect = mode.toLowerCase().includes('direct') || mode.toLowerCase().includes('shortest');
  const totalDistanceKm = Number((directDistanceKm * (isDirect ? 1.04 : 1.16)).toFixed(2));

  let elevGain = 0;
  let elevLoss = 0;
  let maxSlope = 0;
  let slopeSum = 0;

  let currentElev = -4450;

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    
    // Add slight curve deviation based on routing mode
    const lateralCurve = isDirect 
      ? Math.sin(t * Math.PI) * 0.002
      : Math.sin(t * Math.PI) * 0.007;

    const lat = Number((startLat + t * (endLat - startLat) + lateralCurve).toFixed(5));
    const lng = Number((startLng + t * (endLng - startLng) + lateralCurve * 0.5).toFixed(5));
    route_coordinates.push([lat, lng]);

    // Elevation climb up Mount Sharp
    const stepDist = (totalDistanceKm * t);
    const noise = Math.sin(t * 12) * 8.0;
    const targetElev = -4450 + t * 340 + noise;
    const de = targetElev - currentElev;

    if (de > 0) elevGain += de;
    else elevLoss += Math.abs(de);

    const stepSlope = Number((Math.abs(de) / Math.max(1, (totalDistanceKm / numSteps) * 1000) * 180 / Math.PI * 1.5).toFixed(1));
    maxSlope = Math.max(maxSlope, stepSlope);
    slopeSum += stepSlope;

    elevation_profile.push({
      distance_km: Number(stepDist.toFixed(2)),
      elevation_m: Number(targetElev.toFixed(1)),
      slope_deg: stepSlope
    });

    currentElev = targetElev;
  }

  const avgSlope = Number((slopeSum / (numSteps + 1)).toFixed(1));
  const estimatedHours = Number((totalDistanceKm / (isDirect ? 3.4 : 2.8)).toFixed(2));
  const timeMin = Math.round(estimatedHours * 60);
  const energyKj = Math.round(totalDistanceKm * 300);
  const riskScore = Number((avgSlope / 25 * 0.2 + (maxSlope > 15 ? 0.2 : 0.04)).toFixed(3));

  return {
    status: 'success',
    metadata: {
      algorithm,
      profile: mode,
      dem_source: 'HRSC-MOLA Gale Crater 50m Topography Model',
      grid_resolution_m: 50.0,
      timestamp: new Date().toISOString()
    },
    summary: {
      total_distance_km: totalDistanceKm,
      elevation_gain_m: Number(elevGain.toFixed(1)),
      elevation_loss_m: Number(elevLoss.toFixed(1)),
      max_slope_deg: maxSlope,
      avg_slope_deg: avgSlope,
      time_min: timeMin,
      estimated_eva_time_hours: estimatedHours,
      energy_kj: energyKj,
      risk_score: riskScore,
      min_clear_m: 14.5,
      hazard_level: maxSlope > 14.0 ? 'ELEVATED_CAUTION' : 'NOMINAL_SAFE',
      hazard_hits: 0
    },
    route_coordinates,
    elevation_profile,
    traversed_geology: [
      { unit: 'Glen Torridon Clay-bearing Unit', percent: 35.0 },
      { unit: 'Sulfate-bearing Strata', percent: 45.0 },
      { unit: 'Boxwork Ridge Formations', percent: 20.0 }
    ]
  };
}
