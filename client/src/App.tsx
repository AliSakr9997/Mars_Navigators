import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { MissionControl } from './components/MissionControl';
import { MarsMap, MapLayersState } from './components/MarsMap';
import { ElevationProfile } from './components/ElevationProfile';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { SuitTelemetryModal } from './components/SuitTelemetryModal';
import { AttributionModal } from './components/AttributionModal';
import { Waypoint, RouteResponse, TelemetryResponse, TransportMode } from './types/api';
import { computeRealMarsRoute } from './utils/marsPathfindingEngine';
import { ArrowLeft, Home, Sparkles, Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

const INITIAL_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

const DEFAULT_TELEMETRY: TelemetryResponse = {
  status: 'nominal',
  location: 'Gale Crater, Mount Sharp Footprints',
  sol: 4995,
  rems: {
    sol: 4995,
    air_temp_c: -28.0,
    ground_temp_c: -42.0,
    pressure_pa: 777.0,
    wind_speed_ms: 0.0,
    uv_index: 'Moderate',
    diurnal_min_c: -84.0,
    diurnal_max_c: 4.0,
    humidity_relative_percent: 4.5
  },
  rad: {
    dose_rate_mSv_day: 0.58,
    dose_rate_uSv_hour: 24.2,
    cumulative_eva_allowed_hours: 8.0,
    solar_particle_event_alert: false,
    status: 'NOMINAL_MONITORING',
    shielding_recommendation: 'Standard xEMU Multi-Layer Insulation Sufficient'
  },
  disclaimer: 'Curiosity REMS and RAD observation data (NASA PDS / CAB / SwRI).'
};

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'console' | 'traverse'>('landing');
  const [startPoint, setStartPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[0]);
  const [destPoint, setDestPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[1]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);

  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [selectedMode, setSelectedMode] = useState<string>('Balanced');
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(20);
  const [pickMode, setPickMode] = useState<'start' | 'dest' | null>(null);

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [activeOptionId, setActiveOptionId] = useState<string>('P1');
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(DEFAULT_TELEMETRY);

  const [activeHoverCoord, setActiveHoverCoord] = useState<[number, number] | null>(null);

  const [layers, setLayers] = useState<MapLayersState>({
    opticalBasemap: true,
    molaElevation: true,
    geologicalUnits: true,
    slopeHazardMask: true,
    sandDunes: true,
    boxworkFormations: true
  });

  const [isAttributionOpen, setIsAttributionOpen] = useState<boolean>(false);
  const [isSuitTelemetryOpen, setIsSuitTelemetryOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggleLayer = (key: keyof MapLayersState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Initial calculation on load
  useEffect(() => {
    const initialRoute = computeRealMarsRoute({
      start: INITIAL_WAYPOINTS[0],
      destination: INITIAL_WAYPOINTS[1],
      mode: 'Balanced',
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: 20,
      transportMode: 'walking'
    });
    setRouteResult(initialRoute);
    setActiveOptionId('P1');
  }, []);

  // Compute Route using API or built-in A* Pathfinding Engine
  const handleComputeRoute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/route/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startPoint,
          destination: destPoint,
          mode: selectedMode,
          algorithm: 'A* + any-angle smoothing',
          max_slope_deg: maxSlopeDeg,
          transportMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
        setActiveOptionId('P1');
        setLoading(false);
        return;
      }
    } catch {
      // Fallback seamlessly to in-engine solver
    }

    // Direct in-browser multi-candidate A* pathfinding calculation
    const computed = computeRealMarsRoute({
      start: startPoint,
      destination: destPoint,
      mode: selectedMode,
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: maxSlopeDeg,
      transportMode
    });
    setRouteResult(computed);
    setActiveOptionId('P1');
    setLoading(false);
  };

  // Select multi-candidate alternative (P1, P2, P3)
  const handleSelectOption = (optionId: string) => {
    if (!routeResult || !routeResult.options) return;
    const found = routeResult.options.find(o => o.id === optionId);
    if (!found) return;

    setActiveOptionId(optionId);
    setRouteResult({
      ...routeResult,
      activeOptionId: optionId,
      summary: found.summary,
      route_coordinates: found.route_coordinates,
      elevation_profile: found.elevation_profile
    });
  };

  const handleClearRoute = () => {
    setStartPoint(INITIAL_WAYPOINTS[0]);
    setDestPoint(INITIAL_WAYPOINTS[1]);
    const computed = computeRealMarsRoute({
      start: INITIAL_WAYPOINTS[0],
      destination: INITIAL_WAYPOINTS[1],
      mode: 'Balanced',
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: 20,
      transportMode
    });
    setRouteResult(computed);
    setActiveOptionId('P1');
  };

  // Re-compute when transport mode changes
  const handleSelectTransportMode = (mode: TransportMode) => {
    setTransportMode(mode);
    const computed = computeRealMarsRoute({
      start: startPoint,
      destination: destPoint,
      mode: selectedMode,
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: maxSlopeDeg,
      transportMode: mode
    });
    setRouteResult(computed);
    setActiveOptionId('P1');
  };

  // Dynamic life-support and rover battery metrics
  const activeSummary = routeResult?.summary;
  const calculatedDurationHours = activeSummary?.estimated_eva_time_hours || 
    (activeSummary?.time_min ? activeSummary.time_min / 60 : 2.4);

  const calculatedOxygenPercent = Math.max(12, Math.round(100 - (calculatedDurationHours / 8.0) * 100));
  const calculatedSuitBatteryPercent = Math.max(15, Math.round(100 - (calculatedDurationHours / 7.5) * 100));
  const roverBatteryRemainingKwh = Math.max(2.5, Number((25.0 - (activeSummary?.rover_battery_kwh_consumed || 4.2)).toFixed(1)));
  const roverBatteryPercent = Math.round((roverBatteryRemainingKwh / 25.0) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#151210',
      color: '#f2e7d8',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* 1. Landing Start Page with 3D Hovering Mars Planet */}
      {activeView === 'landing' && (
        <LandingPage
          onStartJourney={() => setActiveView('traverse')}
          onOpenConsole={() => setActiveView('console')}
        />
      )}

      {/* 2. Mission Control Console View */}
      {activeView === 'console' && (
        <MissionControl
          telemetry={telemetry}
          onNavigateToHome={() => setActiveView('landing')}
          onNavigateToTraverse={() => setActiveView('traverse')}
          onOpenSources={() => setIsAttributionOpen(true)}
          onOpenSuitTelemetry={() => setIsSuitTelemetryOpen(true)}
        />
      )}

      {/* 3. Traverse Route Planner View */}
      {activeView === 'traverse' && (
        <div style={{ padding: '0 0 40px 0' }}>
          {/* Top Mission Status Bar */}
          <header style={{
            backgroundColor: '#211c18',
            borderBottom: '1px solid #443a33',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Left Brand & Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveView('landing')}
                style={{
                  backgroundColor: '#302923',
                  border: '1px solid #443a33',
                  color: '#bdb0a2',
                  borderRadius: '5px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Return to Home page"
              >
                <Home size={15} color="#bdb0a2" />
                Home
              </button>

              <button
                onClick={() => setActiveView('console')}
                style={{
                  backgroundColor: '#302923',
                  border: '1px solid #7c4c31',
                  color: '#f1a16e',
                  borderRadius: '5px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={15} />
                ← &nbsp; Mission control
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
                <img
                  src="/mission_mark.svg"
                  alt="Mars Navigators"
                  style={{ width: '34px', height: '34px' }}
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#f2e7d8',
                    marginRight: '8px'
                  }}>
                    ARES–Gale
                  </span>
                  <span style={{ fontSize: '13px', color: '#bdb0a2' }}>
                    Team Mars Navigators
                  </span>
                </div>
              </div>
            </div>

            {/* Right Indicators Ribbon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              {/* Mission */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>MISSION</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>ARES-Gale</div>
              </div>

              {/* Sol */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>SOL</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 600, color: '#f2e7d8' }}>{telemetry?.sol || 4995}</div>
              </div>

              {/* Exploration Duration (Walking vs Rover) */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>
                  {transportMode === 'rover' ? 'ROVER TRAVEL' : 'EVA DURATION'}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 500, color: '#f2e7d8' }}>
                  {activeSummary?.time_min ? `${Math.floor(activeSummary.time_min / 60)}h ${Math.round(activeSummary.time_min % 60)}m` : '02h 24m'}
                </div>
              </div>

              {/* Consumable 1: O2 (Walking) or Cabin (Rover) */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }} title="Click to view full suit telemetry">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>
                  {transportMode === 'rover' ? 'CABIN STATUS' : 'O₂ MARGIN'}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>
                  {transportMode === 'rover' ? 'Pressurized' : `${calculatedOxygenPercent}%`}
                </div>
              </div>

              {/* Consumable 2: Suit Battery (Walking) or Rover Battery Pack (Rover) */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }} title="Click to view telemetry">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>
                  {transportMode === 'rover' ? 'ROVER BATT' : 'SUIT BATT'}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>
                  {transportMode === 'rover' ? `${roverBatteryRemainingKwh} kWh (${roverBatteryPercent}%)` : `${calculatedSuitBatteryPercent}%`}
                </div>
              </div>

              {/* Sources link */}
              <button
                onClick={() => setIsAttributionOpen(true)}
                style={{
                  backgroundColor: '#302923',
                  border: '1px solid #443a33',
                  color: '#f1c680',
                  borderRadius: '5px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sources &nbsp;↗
              </button>
            </div>
          </header>

          {/* Main Layout Container */}
          <main style={{
            maxWidth: '1640px',
            margin: '24px auto',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Top Row: Mars Map (66%) + Route Planner Panel (34%) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(600px, 1fr) minmax(380px, 490px)',
              gap: '24px'
            }}>
              <MarsMap
                start={startPoint}
                destination={destPoint}
                route={routeResult}
                onSelectStart={setStartPoint}
                onSelectDestination={setDestPoint}
                activeHoverCoord={activeHoverCoord}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onSelectOption={handleSelectOption}
                pickMode={pickMode}
                onSetPickMode={setPickMode}
              />

              <RoutePlannerPanel
                start={startPoint}
                destination={destPoint}
                waypoints={waypoints}
                onSelectStart={setStartPoint}
                onSelectDestination={setDestPoint}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                maxSlopeDeg={maxSlopeDeg}
                onChangeMaxSlope={setMaxSlopeDeg}
                onComputeRoute={handleComputeRoute}
                onClearRoute={handleClearRoute}
                loading={loading}
                routeResult={routeResult}
                transportMode={transportMode}
                onSelectTransportMode={handleSelectTransportMode}
                pickMode={pickMode}
                onSetPickMode={setPickMode}
              />
            </div>

            {/* Middle Row: 8 Surface Telemetry Cards (Connected) */}
            <TelemetryPanel
              telemetry={telemetry}
              routeResult={routeResult}
            />

            {/* Bottom Row: 3 Lower Cards (Route Metrics, Elevation Profile, Hazard Alerts) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr 1fr',
              gap: '24px'
            }}>
              {/* Card 1: Route Metrics */}
              <div style={{
                backgroundColor: '#201c19',
                border: '1px solid #443a33',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                      {transportMode === 'rover' ? 'Rover Mission Metrics' : 'Astronaut EVA Metrics'}
                    </h3>
                    <span style={{
                      color: (activeSummary?.max_slope_deg || 0) > maxSlopeDeg ? '#f4896b' : '#10b981',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#262920',
                      border: `1px solid ${(activeSummary?.max_slope_deg || 0) > maxSlopeDeg ? '#f4896b' : '#10b981'}`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {(activeSummary?.max_slope_deg || 0) > maxSlopeDeg ? 'Caution: Steep Scarp' : 'Traversable'}
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '18px' }} />

                  {/* 2x4 Numerical Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '16px', columnGap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Total distance</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `${activeSummary.total_distance_km} km` : '3.12 km'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>
                        {transportMode === 'rover' ? 'Rover travel time' : 'Walking time (Tobler)'}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `${activeSummary.time_min || Math.round(activeSummary.estimated_eva_time_hours * 60)} min` : '144 min'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Maximum slope</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `${activeSummary.max_slope_deg.toFixed(1)}°` : '19.1°'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Average slope</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `${activeSummary.avg_slope_deg.toFixed(1)}°` : '6.6°'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Elevation gain</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `+${Math.round(activeSummary.elevation_gain_m)} m` : '+309 m'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Elevation loss</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {activeSummary ? `−${Math.round(activeSummary.elevation_loss_m)} m` : '−56 m'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>
                        {transportMode === 'rover' ? 'Rover battery draw' : 'Suit O₂ consumed'}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {transportMode === 'rover'
                          ? `${activeSummary?.rover_battery_kwh_consumed || 4.2} kWh`
                          : `${activeSummary?.oxygen_consumed_liters || 148} L`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>
                        {transportMode === 'rover' ? 'Powertrain state' : 'Metabolic burn'}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {transportMode === 'rover' ? 'EV Traction Nominal' : `${activeSummary?.energy_kcal || 520} kcal`}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#302923',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
                  <span style={{ color: '#bdb0a2' }}>
                    Active Strategy: <strong style={{ color: '#f2e7d8' }}>{activeOptionId} ({selectedMode})</strong> · Model: A* Any-Angle Smoothing
                  </span>
                </div>
              </div>

              {/* Card 2: Elevation Profile Chart */}
              <div style={{
                backgroundColor: '#201c19',
                border: '1px solid #443a33',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                    Elevation profile
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: '#302923',
                      border: '1px solid #443a33',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: '#f1a16e'
                    }}>
                      HRSC-MOLA
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '18px' }} />

                <div style={{ flex: 1, minHeight: '230px' }}>
                  <ElevationProfile
                    elevationProfile={routeResult?.elevation_profile || []}
                    routeCoordinates={routeResult?.route_coordinates || []}
                    onHoverPoint={(coord) => setActiveHoverCoord(coord)}
                  />
                </div>
              </div>

              {/* Card 3: Scientific Traversal & Hazard Alerts */}
              <div style={{
                backgroundColor: '#201c19',
                border: '1px solid #443a33',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                      Terrain & Hazards
                    </h3>
                    <span style={{
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#1b2c22',
                      border: '1px solid #10b981',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Clearance: {activeSummary?.min_clear_m || 14.2}m
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '18px' }} />

                  {/* Traversed Stratigraphic Units */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#bdb0a2', marginBottom: '8px' }}>
                      Traversed Geological Units (USGS SIM 3292):
                    </div>
                    {(routeResult?.traversed_geology || [
                      { unit: 'Glen Torridon Clay-bearing Unit', percent: 34.0 },
                      { unit: 'Sulfate-Bearing Layered Strata', percent: 46.0 },
                      { unit: 'Boxwork Ridge Formations', percent: 20.0 }
                    ]).map(item => (
                      <div key={item.unit} style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f2e7d8', marginBottom: '2px' }}>
                          <span>{item.unit}</span>
                          <span style={{ fontFamily: 'monospace' }}>{item.percent}%</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: '#332822', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${item.percent}%`,
                            height: '100%',
                            backgroundColor: item.unit.includes('Clay') ? '#aa8b76' : (item.unit.includes('Sulfate') ? '#d5a39d' : '#c0c8a1')
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hazard Checkpoint Notifications */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      backgroundColor: '#26201a',
                      border: '1px solid #7c4c31',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ color: '#f1a16e', fontSize: '15px' }}>⚠</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1a16e' }}>Mount Sharp Scarp Buffer</div>
                        <div style={{ color: '#bdb0a2', fontSize: '11px' }}>
                          Route maintains safe standoff clearance from &gt;20° impassable terrain.
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#26201a',
                      border: '1px solid #7c4c31',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ color: '#f1c680', fontSize: '15px' }}>ℹ</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1c680' }}>
                          {transportMode === 'rover' ? 'Dune Mobility Caution' : 'Basaltic Sand Dune Field'}
                        </div>
                        <div style={{ color: '#bdb0a2', fontSize: '11px' }}>
                          {transportMode === 'rover'
                            ? 'Loose sand creates high wheel-slip sinkage risk. Stay on hard bedrock.'
                            : 'Increased gait effort on loose regolith modeled via Minetti coefficients.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#bdb0a2'
                }}>
                  <span>Point of No Return:</span>
                  <strong style={{ color: '#a855f7', fontFamily: 'monospace' }}>
                    km {routeResult?.pnr?.km || 5.4} ({routeResult?.pnr?.safe ? 'Safe' : 'Caution'})
                  </strong>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Suit Telemetry / REMS Modal */}
      {isSuitTelemetryOpen && (
        <SuitTelemetryModal
          isOpen={isSuitTelemetryOpen}
          telemetry={telemetry}
          onClose={() => setIsSuitTelemetryOpen(false)}
        />
      )}

      {/* Data Attribution Modal */}
      {isAttributionOpen && (
        <AttributionModal
          onClose={() => setIsAttributionOpen(false)}
        />
      )}
    </div>
  );
}
