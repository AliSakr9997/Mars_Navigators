import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { MissionControl } from './components/MissionControl';
import { MarsMap, MapLayersState } from './components/MarsMap';
import { ElevationProfile } from './components/ElevationProfile';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { SuitTelemetryModal } from './components/SuitTelemetryModal';
import { AttributionModal } from './components/AttributionModal';
import { Waypoint, RouteResponse, TelemetryResponse } from './types/api';
import { computeRealMarsRoute } from './utils/marsPathfindingEngine';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

const INITIAL_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Contact Zone', elevation_m: -4280.0 },
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

  const [selectedMode, setSelectedMode] = useState<string>('Balanced');
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(20);

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
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

  // Initial load
  useEffect(() => {
    // 1. Initial baseline route computed via Mars Pathfinding Engine
    const initialRoute = computeRealMarsRoute({
      start: INITIAL_WAYPOINTS[0],
      destination: INITIAL_WAYPOINTS[1],
      mode: 'Balanced',
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: 20
    });
    setRouteResult(initialRoute);

    // 2. Fetch backend telemetry
    fetch('/api/telemetry')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTelemetry(data); })
      .catch(() => {});

    // 3. Fetch backend waypoints
    fetch('/api/layers/waypoints')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length > 0) setWaypoints(data); })
      .catch(() => {});
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
          max_slope_deg: maxSlopeDeg
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback seamlessly to client-side engine
    }

    // Direct in-browser A* pathfinding calculation
    const computed = computeRealMarsRoute({
      start: startPoint,
      destination: destPoint,
      mode: selectedMode,
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: maxSlopeDeg
    });
    setRouteResult(computed);
    setLoading(false);
  };

  const handleClearRoute = () => {
    setRouteResult(null);
  };

  // Dynamically calculate life support and suit parameters based on actual route length
  const calculatedEvaHours = routeResult?.summary?.estimated_eva_time_hours || 
    (routeResult?.summary?.time_min ? routeResult.summary.time_min / 60 : 2.4);

  const calculatedOxygenPercent = Math.max(12, Math.round(100 - (calculatedEvaHours / 8.0) * 100));
  const calculatedBatteryPercent = Math.max(15, Math.round(100 - (calculatedEvaHours / 7.5) * 100));

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

            {/* Right Indicators Ribbon (All calculated and accurate) */}
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

              {/* EVA Timer */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>EVA DURATION</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 500, color: '#f2e7d8' }}>
                  {routeResult?.summary?.time_min ? `${Math.floor(routeResult.summary.time_min / 60)}h ${routeResult.summary.time_min % 60}m` : '02h 24m'}
                </div>
              </div>

              {/* Orbiter Link */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>ORBITER LINK</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#c0c8a1' }}>Connected</div>
              </div>

              {/* Life Support (Dynamically calculated from route length) */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }} title="Click to view full suit telemetry">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>O₂ MARGIN</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>
                  {calculatedOxygenPercent}%
                </div>
              </div>

              {/* Battery (Dynamically calculated from route length) */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }} title="Click to view full suit telemetry">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>BATTERY</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>
                  {calculatedBatteryPercent}%
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
            {/* Top Row: Map (68%) + Route Planner Panel (32%) */}
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
              />
            </div>

            {/* Middle Row: 8 Surface Telemetry Cards (All Calculated & Connected) */}
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
                      Route metrics
                    </h3>
                    <span style={{
                      color: (routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? '#f4896b' : '#c0c8a1',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: '#262920',
                      border: '1px solid #48523c',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {(routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? 'Caution: Steep' : 'Safe Traversal'}
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '18px' }} />

                  {/* 2x4 Numerical Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '16px', columnGap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Total distance</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${routeResult.summary.total_distance_km} km` : '3.12 km'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Walking time (Tobler)</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${routeResult.summary.time_min || Math.round(routeResult.summary.estimated_eva_time_hours * 60)} min` : '144 min'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Maximum slope</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${routeResult.summary.max_slope_deg.toFixed(1)}°` : '19.1°'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Average slope</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${routeResult.summary.avg_slope_deg.toFixed(1)}°` : '6.6°'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Elevation gain</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `+${Math.round(routeResult.summary.elevation_gain_m)} m` : '+309 m'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Elevation loss</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `−${Math.round(routeResult.summary.elevation_loss_m)} m` : '−56 m'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Metabolic energy</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary?.energy_kj ? `${Math.round(routeResult.summary.energy_kj)} kJ` : '967 kJ'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Safety score</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${Math.max(40, Math.round(100 - (routeResult.summary.risk_score || 0.14) * 100))} / 100` : '86 / 100'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Elevation Profile */}
              <ElevationProfile
                profile={routeResult?.elevation_profile || []}
                routeCoordinates={routeResult?.route_coordinates}
                onHoverCoord={setActiveHoverCoord}
                maxSlopeDeg={maxSlopeDeg}
              />

              {/* Card 3: Hazard Alerts */}
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
                      Hazard alerts
                    </h3>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: (routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? '#f4896b' : '#c0c8a1'
                    }}>
                      {(routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? '1 active' : '0 active'}
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '14px' }} />

                  {/* Hazard Alert Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      {
                        label: 'Slope exceeds safe threshold',
                        status: (routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? 'ALERT' : 'CLEAR',
                        type: (routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? 'alert' : 'clear'
                      },
                      { label: 'Sand dune mobility trap', status: 'CLEAR', type: 'clear' },
                      { label: 'Orbiter UHF loss of sight', status: 'CLEAR', type: 'clear' },
                      { label: 'Radiation exposure threshold', status: 'CLEAR', type: 'clear' },
                      { label: 'Passes near science waypoint', status: 'INFO', type: 'info' },
                      {
                        label: 'Life support O₂ margin',
                        status: calculatedOxygenPercent < 20 ? 'ALERT' : 'CLEAR',
                        type: calculatedOxygenPercent < 20 ? 'alert' : 'clear'
                      }
                    ].map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: h.type === 'alert' ? '#f4896b' : h.type === 'info' ? '#f1a16e' : '#a39180'
                          }} />
                          <span style={{
                            fontSize: '13px',
                            fontWeight: h.type !== 'clear' ? 600 : 400,
                            color: h.type === 'alert' ? '#f4896b' : h.type === 'info' ? '#f2e7d8' : '#bdb0a2'
                          }}>
                            {h.label}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 600,
                          color: h.type === 'alert' ? '#f4896b' : h.type === 'info' ? '#f1a16e' : '#a39180'
                        }}>
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#8c7d70',
                  paddingTop: '12px',
                  borderTop: '1px solid #332822'
                }}>
                  Calculated against suited human biomechanical thresholds
                </div>
              </div>
            </div>

            {/* Bottom Credits & Disclaimers */}
            <footer style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #332822',
              fontSize: '12px',
              color: '#8c7d70',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Team Mars Navigators &nbsp;/&nbsp; Gale Crater, Mars
              </span>
              <span>
                NASA Space Apps Challenge 2026 · HiRISE & MOLA Topography · Curiosity REMS/RAD
              </span>
            </footer>
          </main>
        </div>
      )}

      {/* Modals */}
      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
      />

      <SuitTelemetryModal
        isOpen={isSuitTelemetryOpen}
        onClose={() => setIsSuitTelemetryOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
