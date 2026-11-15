import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarsMap } from './components/MarsMap';
import { ElevationProfile } from './components/ElevationProfile';
import { TelemetryPanel } from './components/TelemetryPanel';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { AttributionModal } from './components/AttributionModal';
import { Waypoint, RouteResponse, MultiRouteResponse, CandidateRoute, TelemetryResponse } from './types/api';
import { generateMockRoute } from './utils/mockRoute';

const INITIAL_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

export default function App() {
  const [startPoint, setStartPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[0]);
  const [destPoint, setDestPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[1]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  
  const [selectedProfile, setSelectedProfile] = useState<string>('Balanced');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('A* + any-angle smoothing');
  const [selectedPriority, setSelectedPriority] = useState<string>('Balanced');

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [multiResult, setMultiResult] = useState<MultiRouteResponse | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);

  const [activeHoverCoord, setActiveHoverCoord] = useState<[number, number] | null>(null);
  const [showGeology, setShowGeology] = useState<boolean>(true);
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [isAttributionOpen, setIsAttributionOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [tournamentLoading, setTournamentLoading] = useState<boolean>(false);

  // Fetch initial telemetry and waypoints
  useEffect(() => {
    fetch('/api/telemetry')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTelemetry(data); })
      .catch(() => {});

    fetch('/api/layers/waypoints')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length > 0) setWaypoints(data); })
      .catch(() => {});
  }, []);

  // Compute single route
  const handleComputeRoute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/route/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startPoint,
          destination: destPoint,
          mode: selectedProfile,
          algorithm: selectedAlgorithm,
          max_slope_deg: 25.0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
      } else {
        throw new Error('Backend offline');
      }
    } catch {
      // Offline fallback
      const fallback = generateMockRoute({
        start: startPoint,
        destination: destPoint,
        mode: selectedProfile,
        algorithm: selectedAlgorithm,
        max_slope_deg: 25.0
      });
      setRouteResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Run Multi-Model Tournament
  const handleRunTournament = async () => {
    setTournamentLoading(true);
    try {
      const res = await fetch('/api/route/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startPoint,
          destination: destPoint,
          algorithms: [
            "A* + any-angle smoothing",
            "A*",
            "Dijkstra",
            "Weighted A* (ε=2.5)"
          ],
          profiles: [
            "Balanced",
            "Safest (max clearance)",
            "Min slope",
            "Energy saver"
          ],
          priority: selectedPriority
        })
      });

      if (res.ok) {
        const data: MultiRouteResponse = await res.json();
        setMultiResult(data);
        setRouteResult(data.best_route);
      } else {
        throw new Error('Analyze API unavailable');
      }
    } catch {
      // Offline fallback tournament simulation
      const fallbackRoute = generateMockRoute({
        start: startPoint,
        destination: destPoint,
        mode: selectedProfile,
        algorithm: selectedAlgorithm
      });

      const mockCandidates: CandidateRoute[] = [
        { rank: 1, profile: 'Balanced', algorithm: 'A* + any-angle smoothing', total_distance_km: 5.43, time_min: 116.8, estimated_eva_time_hours: 1.95, energy_kj: 1613, risk_score: 0.059, max_slope_deg: 5.8, avg_slope_deg: 2.2, min_clear_m: 24, composite_score: 0.02, feasible: true, compute_time_s: 0.012, expanded_nodes: 142 },
        { rank: 2, profile: 'Safest (max clearance)', algorithm: 'A* + any-angle smoothing', total_distance_km: 5.82, time_min: 122.4, estimated_eva_time_hours: 2.04, energy_kj: 1720, risk_score: 0.041, max_slope_deg: 4.9, avg_slope_deg: 1.8, min_clear_m: 38, composite_score: 0.08, feasible: true, compute_time_s: 0.015, expanded_nodes: 185 },
        { rank: 3, profile: 'Min slope', algorithm: 'A*', total_distance_km: 5.65, time_min: 119.0, estimated_eva_time_hours: 1.98, energy_kj: 1650, risk_score: 0.048, max_slope_deg: 4.2, avg_slope_deg: 1.9, min_clear_m: 28, composite_score: 0.12, feasible: true, compute_time_s: 0.009, expanded_nodes: 210 },
        { rank: 4, profile: 'Energy saver', algorithm: 'A*', total_distance_km: 5.35, time_min: 114.2, estimated_eva_time_hours: 1.90, energy_kj: 1540, risk_score: 0.065, max_slope_deg: 6.4, avg_slope_deg: 2.4, min_clear_m: 18, composite_score: 0.19, feasible: true, compute_time_s: 0.008, expanded_nodes: 195 },
        { rank: 5, profile: 'Shortest distance', algorithm: 'Dijkstra', total_distance_km: 5.12, time_min: 110.5, estimated_eva_time_hours: 1.84, energy_kj: 1510, risk_score: 0.092, max_slope_deg: 8.5, avg_slope_deg: 3.1, min_clear_m: 8, composite_score: 0.28, feasible: true, compute_time_s: 0.028, expanded_nodes: 950 }
      ];

      setMultiResult({
        status: 'success',
        priority: selectedPriority,
        best_candidate: mockCandidates[0],
        best_route: fallbackRoute,
        candidates: mockCandidates,
        total_evaluated: mockCandidates.length
      });
      setRouteResult(fallbackRoute);
    } finally {
      setTournamentLoading(false);
    }
  };

  // Preview candidate from tournament leaderboard
  const handleSelectCandidate = (c: CandidateRoute) => {
    setSelectedProfile(c.profile);
    setSelectedAlgorithm(c.algorithm);
    handleComputeRoute();
  };

  // Auto-compute on start/destination change
  useEffect(() => {
    handleComputeRoute();
  }, [startPoint, destPoint]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#070a13',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* 1. Top Tactical Mission Header */}
      <Header
        onOpenAttribution={() => setIsAttributionOpen(true)}
        evaTimeHours={routeResult?.summary.estimated_eva_time_hours}
      />

      {/* 2. Main 3-Column Field Console Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        
        {/* Left Sidebar: Telemetry & Geospatial Layers */}
        <TelemetryPanel
          telemetry={telemetry}
          waypoints={waypoints}
          startPoint={startPoint}
          destPoint={destPoint}
          onSelectStart={setStartPoint}
          onSelectDestination={setDestPoint}
          showGeology={showGeology}
          setShowGeology={setShowGeology}
          showHazards={showHazards}
          setShowHazards={setShowHazards}
        />

        {/* Center: Full Interactive Map + Bottom Elevation Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, position: 'relative' }}>
          {/* Map Viewport */}
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <MarsMap
              start={startPoint}
              destination={destPoint}
              route={routeResult}
              onSelectStart={setStartPoint}
              onSelectDestination={setDestPoint}
              activeHoverCoord={activeHoverCoord}
              showGeology={showGeology}
              showHazards={showHazards}
            />
          </div>

          {/* Elevation Profile Drawer */}
          <div style={{ padding: '8px 12px', backgroundColor: '#070a13', borderTop: '1px solid #1e293b' }}>
            <ElevationProfile
              profile={routeResult?.elevation_profile || []}
              routeCoordinates={routeResult?.route_coordinates}
              onHoverCoord={setActiveHoverCoord}
            />
          </div>
        </div>

        {/* Right Sidebar: Traverse Planner & Multi-Model Tournament */}
        <RoutePlannerPanel
          route={routeResult}
          multiResult={multiResult}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          selectedAlgorithm={selectedAlgorithm}
          setSelectedAlgorithm={setSelectedAlgorithm}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          onComputeRoute={handleComputeRoute}
          onRunTournament={handleRunTournament}
          onSelectCandidate={handleSelectCandidate}
          loading={loading}
          tournamentLoading={tournamentLoading}
        />

      </div>

      {/* 3. NASA Attribution & Scientific Integrity Modal */}
      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
      />
    </div>
  );
}
