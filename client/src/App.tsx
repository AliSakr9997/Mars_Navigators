import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarsMap } from './components/MarsMap';
import { ElevationProfile } from './components/ElevationProfile';
import { SuitTelemetryModal } from './components/SuitTelemetryModal';
import { AttributionModal } from './components/AttributionModal';
import { Navigation, Zap, ShieldCheck, Mountain, Activity, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Waypoint, RouteResponse, MultiRouteResponse, CandidateRoute, TelemetryResponse } from './types/api';
import { generateMockRoute } from './utils/mockRoute';

const INITIAL_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

const PROFILES = [
  "Balanced",
  "Safest (max clearance)",
  "Min slope",
  "Energy saver",
  "Shortest distance"
];

const ALGORITHMS = [
  "A* + any-angle smoothing",
  "A*",
  "Dijkstra",
  "Weighted A* (ε=2.5)",
  "Greedy best-first"
];

const PRIORITIES = [
  "Balanced",
  "Safety first",
  "Speed first",
  "Energy / O2 first"
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
  const [isSuitTelemetryOpen, setIsSuitTelemetryOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [tournamentLoading, setTournamentLoading] = useState<boolean>(false);

  // Fetch telemetry & waypoints
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
        throw new Error('API offline');
      }
    } catch {
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

  // Run Tournament
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

  const handleSelectCandidate = (c: CandidateRoute) => {
    setSelectedProfile(c.profile);
    setSelectedAlgorithm(c.algorithm);
    handleComputeRoute();
  };

  // Auto-compute on start/destination change
  useEffect(() => {
    handleComputeRoute();
  }, [startPoint, destPoint]);

  const summary = routeResult?.summary;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0c0d10',
      color: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header Bar */}
      <Header
        onOpenAttribution={() => setIsAttributionOpen(true)}
        onOpenSuitTelemetry={() => setIsSuitTelemetryOpen(true)}
        evaTimeHours={summary?.estimated_eva_time_hours}
      />

      {/* 2. Main Workspace Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        padding: '12px 18px',
        gap: '12px',
        overflowY: 'auto'
      }}>
        
        {/* UPPER ROW: Map Reconnaissance Canvas (68%) + Traverse Planner (32%) */}
        <div style={{ display: 'flex', gap: '12px', height: '54%', minHeight: '360px' }}>
          
          {/* Map Section */}
          <div style={{
            flex: '1 1 68%',
            backgroundColor: '#12141a',
            border: '1px solid #1f232d',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Map Top Subheader with Layer Controls */}
            <div style={{
              padding: '8px 14px',
              backgroundColor: '#0e1015',
              borderBottom: '1px solid #1f232d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e06c3a' }} />
                <strong style={{ color: '#f3f4f6', letterSpacing: '0.5px' }}>SURFACE RECONNAISSANCE // GALE CRATER</strong>
                <span style={{ color: '#6b7280' }}>| CTX ORBITAL MOSAIC</span>
              </div>

              {/* Layer Switches */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#9ca3af' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showGeology}
                    onChange={(e) => setShowGeology(e.target.checked)}
                    style={{ accentColor: '#e06c3a' }}
                  />
                  <span>USGS / CRISM Geology</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showHazards}
                    onChange={(e) => setShowHazards(e.target.checked)}
                    style={{ accentColor: '#ef4444' }}
                  />
                  <span>Dune Hazards (&gt;25°)</span>
                </label>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative' }}>
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
          </div>

          {/* Traverse Planner Configuration Card */}
          <div style={{
            flex: '0 0 32%',
            backgroundColor: '#12141a',
            border: '1px solid #1f232d',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#e06c3a' }}>
                <Navigation size={18} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, letterSpacing: '0.8px' }}>
                  TRAVERSE PLANNER // CONFIGURATION
                </h3>
              </div>

              {/* Waypoints Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    START WAYPOINT (DEPLOYMENT SITE)
                  </label>
                  <select
                    value={startPoint.name}
                    onChange={(e) => setStartPoint(waypoints.find(w => w.name === e.target.value) || waypoints[0])}
                    style={{
                      width: '100%',
                      backgroundColor: '#0c0d12',
                      border: '1px solid #282d39',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f3f4f6',
                      fontSize: '12px'
                    }}
                  >
                    {waypoints.map(w => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    TARGET OBJECTIVE (BOXWORK FORMATION)
                  </label>
                  <select
                    value={destPoint.name}
                    onChange={(e) => setDestPoint(waypoints.find(w => w.name === e.target.value) || waypoints[1])}
                    style={{
                      width: '100%',
                      backgroundColor: '#0c0d12',
                      border: '1px solid #282d39',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#f3f4f6',
                      fontSize: '12px'
                    }}
                  >
                    {waypoints.map(w => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optimization Profile */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  COST SURFACE PROFILE
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0c0d12',
                    border: '1px solid #282d39',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                >
                  {PROFILES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Algorithm Model */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  PATHFINDING ALGORITHM
                </label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0c0d12',
                    border: '1px solid #282d39',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                >
                  {ALGORITHMS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleComputeRoute}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#e06c3a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '11px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 16px rgba(224, 108, 58, 0.4)'
                }}
              >
                <Navigation size={15} />
                {loading ? 'CALCULATING TRAVERSE...' : 'PLAN TRAVERSE'}
              </button>

              <button
                onClick={handleRunTournament}
                disabled={tournamentLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#0c0d12',
                  border: '1px solid #2a2e3a',
                  color: '#38bdf8',
                  borderRadius: '6px',
                  padding: '9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: tournamentLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                {tournamentLoading ? 'RUNNING MULTI-MODEL TOURNAMENT...' : '⚡ RUN MULTI-MODEL TOURNAMENT'}
              </button>
            </div>
          </div>
        </div>

        {/* LOWER ROW: 3 Equal Tactical Dashboard Panels */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: '260px' }}>
          
          {/* Panel 1: Traverse Metrics */}
          <div style={{
            flex: '1 1 28%',
            backgroundColor: '#12141a',
            border: '1px solid #1f232d',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f232d', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <ShieldCheck size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>TRAVERSE METRICS</span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: summary?.hazard_level === 'NOMINAL_SAFE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: summary?.hazard_level === 'NOMINAL_SAFE' ? '#10b981' : '#ef4444'
              }}>
                {summary?.hazard_level || 'NOMINAL_SAFE'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Total Distance:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#f3f4f6' }}>{summary?.total_distance_km || 5.43} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>EVA Walking Time:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                  {summary?.time_min ? `${Math.round(summary.time_min)} min` : '117 min'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Metabolic Energy (Minetti):</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#e06c3a' }}>
                  {summary?.energy_kj ? `${Math.round(summary.energy_kj)} kJ` : '1,613 kJ'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Elevation Climb / Descent:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#10b981' }}>
                  +{summary?.elevation_gain_m || 335}m / -{summary?.elevation_loss_m || 24}m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Max / Avg Slope:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: (summary?.max_slope_deg || 5.8) > 15 ? '#ef4444' : '#10b981' }}>
                  {summary?.max_slope_deg || 5.8}° / {summary?.avg_slope_deg || 2.2}°
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Clearance to Hazards:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#cbd5e1' }}>{summary?.min_clear_m || 24.0} m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Composite Risk Score:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#10b981' }}>{summary?.risk_score || 0.059}</span>
              </div>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1f232d', fontSize: '9px', color: '#6b7280' }}>
              * Calculated via Tobler Martian hiking velocity and Minetti metabolic equation (130 kg suited mass).
            </div>
          </div>

          {/* Panel 2: Elevation Cross-Section Profile */}
          <div style={{
            flex: '1 1 42%',
            backgroundColor: '#12141a',
            border: '1px solid #1f232d',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <ElevationProfile
              profile={routeResult?.elevation_profile || []}
              routeCoordinates={routeResult?.route_coordinates}
              onHoverCoord={setActiveHoverCoord}
            />
          </div>

          {/* Panel 3: Stratigraphy & Tournament Leaderboard */}
          <div style={{
            flex: '1 1 30%',
            backgroundColor: '#12141a',
            border: '1px solid #1f232d',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', marginBottom: '8px' }}>
                <Layers size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  STRATIGRAPHY & LEADERBOARD
                </span>
              </div>

              {/* Traversed Strata Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>TRAVERSED GEOLOGICAL STRATA</div>
                <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#1f232d' }}>
                  <div style={{ width: '35%', backgroundColor: '#06b6d4' }} title="Clay Unit" />
                  <div style={{ width: '45%', backgroundColor: '#a855f7' }} title="Sulfate Strata" />
                  <div style={{ width: '20%', backgroundColor: '#e06c3a' }} title="Boxwork Veins" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>
                  <span style={{ color: '#06b6d4' }}>Clay 35%</span>
                  <span style={{ color: '#a855f7' }}>Sulfate 45%</span>
                  <span style={{ color: '#e06c3a' }}>Boxwork 20%</span>
                </div>
              </div>

              {/* Tournament Candidate Mini Table */}
              {multiResult ? (
                <div>
                  <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
                    ★ TOURNAMENT WINNER ({multiResult.priority.toUpperCase()})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                    {multiResult.candidates.map(c => (
                      <div
                        key={`${c.profile}-${c.algorithm}`}
                        onClick={() => handleSelectCandidate(c)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#0c0d12',
                          border: routeResult?.metadata.algorithm === c.algorithm && routeResult?.metadata.profile === c.profile ? '1px solid #e06c3a' : '1px solid #1f232d',
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: c.rank === 1 ? '#e06c3a' : '#f3f4f6' }}>
                          #{c.rank} {c.profile} ({c.algorithm.split(' ')[0]})
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '9px' }}>{c.total_distance_km}km · {Math.round(c.time_min)}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#0c0d12', border: '1px solid #1f232d', borderRadius: '6px', padding: '10px', fontSize: '11px', color: '#6b7280' }}>
                  Click <strong>"Run Multi-Model Tournament"</strong> above to benchmark Dijkstra, A*, Weighted A*, and Any-Angle Smoothing across mission priorities.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#10b981', marginTop: '6px' }}>
              <CheckCircle2 size={13} />
              <span>NASA USGS Astrogeology DEM & REMS Integrated</span>
            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <SuitTelemetryModal
        isOpen={isSuitTelemetryOpen}
        onClose={() => setIsSuitTelemetryOpen(false)}
        telemetry={telemetry}
        evaTimeHours={summary?.estimated_eva_time_hours}
      />

      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
      />
    </div>
  );
}
