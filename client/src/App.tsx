import React, { useState, useEffect } from 'react';
import { MissionControl } from './components/MissionControl';
import { MarsMap, MapLayersState } from './components/MarsMap';
import { ElevationProfile } from './components/ElevationProfile';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { SuitTelemetryModal } from './components/SuitTelemetryModal';
import { AttributionModal } from './components/AttributionModal';
import { Waypoint, RouteResponse, TelemetryResponse } from './types/api';
import { generateMockRoute } from './utils/mockRoute';
import { ArrowLeft, CheckCircle2, AlertTriangle, Info, ShieldCheck, Compass } from 'lucide-react';

const INITIAL_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Contact Zone', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

export default function App() {
  const [activeView, setActiveView] = useState<'console' | 'traverse'>('traverse');
  const [startPoint, setStartPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[0]);
  const [destPoint, setDestPoint] = useState<Waypoint>(INITIAL_WAYPOINTS[1]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);

  const [selectedMode, setSelectedMode] = useState<string>('Balanced');
  const [maxSlopeDeg, setMaxSlopeDeg] = useState<number>(20);

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);

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
    // 1. Initial baseline route
    const initialRoute = generateMockRoute({
      start: INITIAL_WAYPOINTS[0],
      destination: INITIAL_WAYPOINTS[1],
      mode: 'Balanced',
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

  // Compute Route
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
      } else {
        throw new Error('Fallback to local model');
      }
    } catch {
      const fallback = generateMockRoute({
        start: startPoint,
        destination: destPoint,
        mode: selectedMode,
        max_slope_deg: maxSlopeDeg
      });
      setRouteResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRouteResult(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#151210',
      color: '#f2e7d8',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* If Mission Control View is Active */}
      {activeView === 'console' && (
        <MissionControl
          telemetry={telemetry}
          onNavigateToTraverse={() => setActiveView('traverse')}
          onOpenSources={() => setIsAttributionOpen(true)}
          onOpenSuitTelemetry={() => setIsSuitTelemetryOpen(true)}
        />
      )}

      {/* If Traverse View is Active */}
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
            {/* Left Brand & Return to Mission Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                <ArrowLeft size={16} />
                ← &nbsp; Mission control
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/mission_mark.svg"
                  alt="ARES-Gale"
                  style={{ width: '34px', height: '34px' }}
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#f2e7d8',
                    marginRight: '8px'
                  }}>
                    ARES–Gale
                  </span>
                  <span style={{ fontSize: '14px', color: '#bdb0a2' }}>
                    Surface operations
                  </span>
                </div>
              </div>
            </div>

            {/* Right Indicators Ribbon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
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
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>EVA TIMER</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 500, color: '#f2e7d8' }}>01:24:36</div>
              </div>

              {/* Orbiter Link */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>ORBITER LINK</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#c0c8a1' }}>Connected</div>
              </div>

              {/* Comms Delay */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>COMMS DELAY</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>12m 08s</div>
              </div>

              {/* Life Support */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>LIFE SUPPORT</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>84%</div>
              </div>

              {/* Battery */}
              <div onClick={() => setIsSuitTelemetryOpen(true)} style={{ cursor: 'pointer' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>BATTERY</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: 600, color: '#f2e7d8' }}>72%</div>
              </div>

              {/* Mission Phase */}
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>MISSION PHASE</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#f2e7d8' }}>Traverse planning</div>
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

            {/* Middle Row: 8 Surface Telemetry Cards */}
            <TelemetryPanel telemetry={telemetry} />

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
                      color: '#c0c8a1',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: '#262920',
                      border: '1px solid #48523c',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Safe
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
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Estimated EVA time</div>
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
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Hazard count</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary.hazard_hits !== undefined ? routeResult.summary.hazard_hits : 0}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#bdb0a2', marginBottom: '4px' }}>Safety score</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 600, color: '#f2e7d8' }}>
                        {routeResult?.summary ? `${Math.round(100 - (routeResult.summary.risk_score || 0.14) * 100)} / 100` : '86 / 100'}
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
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#f1c680' }}>
                      1 active
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '14px' }} />

                  {/* Hazard Alert Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Slope exceeds safe limit', status: (routeResult?.summary?.max_slope_deg || 0) > maxSlopeDeg ? 'ALERT' : 'CLEAR', type: 'clear' },
                      { label: 'Sand dune detected', status: 'CLEAR', type: 'clear' },
                      { label: 'Communication loss risk', status: 'CLEAR', type: 'clear' },
                      { label: 'Radiation exposure warning', status: 'CLEAR', type: 'clear' },
                      { label: 'Route passes near scientific target', status: 'INFO', type: 'info' },
                      { label: 'Insufficient life support margin', status: 'CLEAR', type: 'clear' }
                    ].map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: h.type === 'info' ? '#f1a16e' : '#a39180'
                          }} />
                          <span style={{
                            fontSize: '13px',
                            fontWeight: h.type === 'info' ? 600 : 400,
                            color: h.type === 'info' ? '#f2e7d8' : '#bdb0a2'
                          }}>
                            {h.label}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 600,
                          color: h.type === 'info' ? '#f1a16e' : '#a39180'
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
                  Scenario indicators · simulated conditions
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
                ARES-Gale &nbsp;/&nbsp; Gale Crater, Mars
              </span>
              <span>
                NASA/JPL-Caltech/University of Arizona · HiRISE image; EVA overlays and profiles simulated
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
