import React, { useState, useEffect } from 'react';
import { Orbit, ChevronsRight } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { MissionControl } from './components/MissionControl';
import { FieldWorkspace } from './mission/FieldWorkspace';
import { SuitTelemetryModal } from './components/SuitTelemetryModal';
import { AttributionModal } from './components/AttributionModal';
import { FlightScene } from './mission/FlightScene';
import { Waypoint, RouteResponse, TelemetryResponse, TransportMode } from './types/api';
import { computeRealMarsRoute, getMarsElevation } from './utils/marsPathfindingEngine';
import { MapLayersState } from './components/MarsMap';
import './mission/mission.css';

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

type AppStage = 'flight' | 'start' | 'workspace' | 'control';

export default function App() {
  // Check if user already saw the intro during this session
  const [stage, setStage] = useState<AppStage>(() => {
    try {
      const saved = sessionStorage.getItem('ares.nav.stage');
      if (saved === 'workspace') return 'workspace';
      if (saved === 'start') return 'start';
    } catch {}
    return 'flight';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

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

  // Initial calculation on load
  useEffect(() => {
    const initialRoute = computeRealMarsRoute({
      start: startPoint,
      destination: destPoint,
      mode: 'Balanced',
      algorithm: 'A* + any-angle smoothing',
      max_slope_deg: maxSlopeDeg,
      transportMode
    });
    setRouteResult(initialRoute);
    setActiveOptionId('P1');
  }, []);

  // Compute route via API with seamless fallback to in-engine solver
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
      // Seamless fallback to client-side pathfinding engine
    }

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

  const handleToggleLayer = (key: keyof MapLayersState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleMapClickCoord = (lat: number, lng: number) => {
    const elev = getMarsElevation(lat, lng);
    const newWp: Waypoint = {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      name: `Site (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
      elevation_m: elev
    };

    if (pickMode === 'start') {
      setStartPoint(newWp);
      setPickMode(null);
    } else if (pickMode === 'dest') {
      setDestPoint(newWp);
      setPickMode(null);
    }
  };

  const handleElevationHover = (coord: [number, number] | null) => {
    setActiveHoverCoord(coord);
  };

  const handleLandingComplete = () => {
    try { sessionStorage.setItem('ares.nav.stage', 'start'); } catch {}
    setStage('start');
  };

  const handleStartJourney = () => {
    try { sessionStorage.setItem('ares.nav.stage', 'workspace'); } catch {}
    setStage('workspace');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0a09',
      color: '#fff3e7',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* 1. First Cinematic Scene: Atmospheric Flight & Lander Touchdown (from Adham) */}
      {stage === 'flight' && (
        <main className="mission-entry state-flight">
          <FlightScene
            flying={true}
            reduced={reducedMotion}
            onLanding={handleLandingComplete}
          />
          <header className="mission-mast">
            <div className="mission-brand">
              <Orbit aria-hidden="true" />
              <span>MARS NAVIGATORS<span className="brand-dash">—</span>ARES</span>
            </div>
            <button
              className="intro-skip"
              onClick={handleLandingComplete}
            >
              Skip intro <ChevronsRight size={16} />
            </button>
          </header>
          <div className="flight-track" role="status" aria-label="Approaching Mars">
            <i />
          </div>
          <footer className="surface-caption">
            <div><span className="location-line" />GALE CRATER</div>
            <span>Mount Sharp Foothills · Atmospheric Descent</span>
          </footer>
        </main>
      )}

      {/* 2. Merged Start Hub: 3D Floating Mars Planet + Team Quote + Features */}
      {stage === 'start' && (
        <LandingPage
          onStartJourney={handleStartJourney}
          onOpenConsole={() => setStage('control')}
          onReplayCinematic={() => setStage('flight')}
          onOpenSources={() => setIsAttributionOpen(true)}
        />
      )}

      {/* 3. Field Mission Workspace: Side Menu + Genuine NASA GIS Map + Linked Telemetry */}
      {stage === 'workspace' && (
        <FieldWorkspace
          startPoint={startPoint}
          destPoint={destPoint}
          waypoints={waypoints}
          routeResult={routeResult}
          activeOptionId={activeOptionId}
          transportMode={transportMode}
          selectedMode={selectedMode}
          maxSlopeDeg={maxSlopeDeg}
          pickMode={pickMode}
          layers={layers}
          telemetry={telemetry}
          loading={loading}
          activeHoverCoord={activeHoverCoord}
          onSetStartPoint={setStartPoint}
          onSetDestPoint={setDestPoint}
          onSelectOption={handleSelectOption}
          onToggleLayer={handleToggleLayer}
          onSetTransportMode={handleSelectTransportMode}
          onSetSelectedMode={setSelectedMode}
          onSetMaxSlopeDeg={setMaxSlopeDeg}
          onSetPickMode={setPickMode}
          onComputeRoute={handleComputeRoute}
          onMapClickCoord={handleMapClickCoord}
          onElevationHover={handleElevationHover}
          onReturnHome={() => setStage('start')}
        />
      )}

      {/* 4. Mission Control View */}
      {stage === 'control' && (
        <MissionControl
          telemetry={telemetry}
          onNavigateToHome={() => setStage('start')}
          onNavigateToTraverse={() => setStage('workspace')}
          onOpenSources={() => setIsAttributionOpen(true)}
          onOpenSuitTelemetry={() => setIsSuitTelemetryOpen(true)}
        />
      )}

      {/* Standalone Modals */}
      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
      />

      <SuitTelemetryModal
        isOpen={isSuitTelemetryOpen}
        onClose={() => setIsSuitTelemetryOpen(false)}
        telemetry={telemetry}
        route={routeResult}
        activeOptionId={activeOptionId}
        transportMode={transportMode}
      />
    </div>
  );
}
