import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Compass,
  Database,
  MapPin,
  Orbit,
  PanelLeftClose,
  PanelLeftOpen,
  Home
} from 'lucide-react';
import { MapLayersState } from '../components/MarsMap';
import { SuitTelemetryView } from '../components/SuitTelemetryView';
import { AttributionModal } from '../components/AttributionModal';
import { Waypoint, RouteResponse, TelemetryResponse, TransportMode } from '../types/api';
import { getMarsElevation } from '../utils/marsPathfindingEngine';
import catalog from './catalog.json';
import './workspace.css';

export interface FieldWorkspaceProps {
  startPoint: Waypoint;
  destPoint: Waypoint;
  waypoints: Waypoint[];
  routeResult: RouteResponse | null;
  activeOptionId: string;
  transportMode: TransportMode;
  selectedMode: string;
  maxSlopeDeg: number;
  pickMode: 'start' | 'dest' | null;
  layers: MapLayersState;
  telemetry: TelemetryResponse | null;
  loading: boolean;
  activeHoverCoord: [number, number] | null;
  onSetStartPoint: (pt: Waypoint) => void;
  onSetDestPoint: (pt: Waypoint) => void;
  onSelectOption: (id: string) => void;
  onToggleLayer: (key: keyof MapLayersState) => void;
  onSetTransportMode: (mode: TransportMode) => void;
  onSetSelectedMode: (mode: string) => void;
  onSetMaxSlopeDeg: (slope: number) => void;
  onSetPickMode: (mode: 'start' | 'dest' | null) => void;
  onComputeRoute: () => void;
  onMapClickCoord?: (lat: number, lng: number) => void;
  onElevationHover: (coord: [number, number] | null) => void;
  onReturnHome: () => void;
}

const SCIENCE_SITES: Record<string, { lat: number; lng: number; name: string; elevation_m: number }> = {
  'Bradbury Landing': { lat: -4.5895, lng: 137.4417, name: 'Bradbury Landing', elevation_m: -4501.0 },
  'Rocknest': { lat: -4.5950, lng: 137.4480, name: 'Rocknest Eolian Deposit', elevation_m: -4512.0 },
  'Hottah': { lat: -4.5910, lng: 137.4390, name: 'Hottah Conglomerate Outcrop', elevation_m: -4498.0 },
  'Yellowknife Bay': { lat: -4.5925, lng: 137.4460, name: 'Yellowknife Bay Mudstone', elevation_m: -4520.0 },
  'John Klein': { lat: -4.5930, lng: 137.4450, name: 'John Klein Drill Site', elevation_m: -4518.0 },
  'Cumberland': { lat: -4.5935, lng: 137.4465, name: 'Cumberland Drill Site', elevation_m: -4516.0 },
  'Mojave 2': { lat: -4.6460, lng: 137.4080, name: 'Mojave 2 Pahrump Hills', elevation_m: -4450.0 },
  'Confidence Hills': { lat: -4.6450, lng: 137.4090, name: 'Confidence Hills Drill Site', elevation_m: -4452.0 },
  'Vera Rubin Ridge': { lat: -4.7180, lng: 137.4850, name: 'Vera Rubin Ridge Hematite', elevation_m: -4120.0 },
  'High Dune': { lat: -4.6520, lng: 137.3980, name: 'High Dune Active Sands', elevation_m: -4465.0 },
  'Namib Dune': { lat: -4.6540, lng: 137.3960, name: 'Namib Dune Slipface', elevation_m: -4468.0 },
  'Pahrump Hills': { lat: -4.6440, lng: 137.4070, name: 'Pahrump Hills Basal Unit', elevation_m: -4448.0 },
  'Murray Buttes': { lat: -4.6780, lng: 137.4250, name: 'Murray Buttes Outcrops', elevation_m: -4320.0 }
};

const screens = [
  { name: 'Field console', icon: Compass },
  { name: 'Suit readings', icon: Activity }
];

export const FieldWorkspace: React.FC<FieldWorkspaceProps> = ({
  startPoint,
  destPoint,
  routeResult,
  activeOptionId,
  transportMode,
  telemetry,
  onSetDestPoint,
  onComputeRoute,
  onReturnHome
}) => {
  const [screen, setScreen] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<boolean>(() => window.innerWidth < 760);
  const [sourcesOpen, setSourcesOpen] = useState<boolean>(false);

  // Mission setup
  const [missionName, setMissionName] = useState<string>('ARES-Gale');
  const [missionPhase, setMissionPhase] = useState<string>('Traverse planning');
  const [groupIndex, setGroupIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);

  const schematicFrame = useRef<HTMLIFrameElement>(null);

  const currentGroup = catalog[groupIndex] || catalog[0];
  const currentTarget = currentGroup.targets[targetIndex] || currentGroup.targets[0];

  const syncIframe = () => {
    if (!schematicFrame.current?.contentWindow) return;
    try {
      schematicFrame.current.contentWindow.postMessage({
        type: 'mission',
        mission: {
          name: missionName,
          phase: missionPhase,
          objective: currentTarget.description,
          sites: currentTarget.sites
        }
      }, window.location.origin);

      if (destPoint && destPoint.name) {
        schematicFrame.current.contentWindow.postMessage({
          type: 'site',
          name: destPoint.name
        }, window.location.origin);
      }
    } catch {}
  };

  const handleSelectSite = (site: { name: string; x: number; y: number }) => {
    let targetWaypoint: Waypoint;
    if (SCIENCE_SITES[site.name]) {
      targetWaypoint = SCIENCE_SITES[site.name];
    } else {
      const lat = Number((-4.67 - (site.y - 0.5) * 0.12).toFixed(6));
      const lng = Number((137.45 + (site.x - 0.5) * 0.12).toFixed(6));
      const elevation_m = getMarsElevation(lat, lng);
      targetWaypoint = { lat, lng, name: site.name, elevation_m };
    }

    onSetDestPoint(targetWaypoint);
    setScreen(0); // Switch to Field console

    if (schematicFrame.current?.contentWindow) {
      try {
        schematicFrame.current.contentWindow.postMessage({
          type: 'mission',
          mission: {
            name: missionName,
            phase: missionPhase,
            objective: currentTarget.description,
            sites: currentTarget.sites
          }
        }, window.location.origin);

        schematicFrame.current.contentWindow.postMessage({
          type: 'site',
          name: site.name
        }, window.location.origin);
      } catch {}
    }
  };

  // Sync iframe whenever mission objective changes
  useEffect(() => {
    syncIframe();
  }, [groupIndex, targetIndex, missionName, missionPhase]);

  // Keep route updated when target site is selected
  useEffect(() => {
    onComputeRoute();
  }, [destPoint.name, destPoint.lat, destPoint.lng]);

  const activeRoute = routeResult?.options?.find(r => r.id === activeOptionId) 
    || routeResult?.options?.[0];
  const activeSummary = activeRoute?.summary || routeResult?.summary;

  return (
    <main className={'field-workspace' + (collapsed ? ' rail-closed' : '')} style={{ minHeight: '100vh' }}>
      {/* Collapsible Mission Sidebar Rail */}
      <aside className="field-rail" aria-label="Mission sidebar">
        {/* Brand Header */}
        <header style={{ paddingBottom: '12px', borderBottom: '1px solid #513135' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Orbit size={22} color="#ff9b87" />
            <div>
              <strong style={{ fontSize: '15px', color: '#fff0e9', display: 'block', letterSpacing: '0.5px' }}>
                ARES / GALE
              </strong>
              <span style={{ fontSize: '10px', color: '#ff9b87', fontFamily: "'IBM Plex Mono', monospace" }}>
                MARS NAVIGATORS
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              title="Return to 3D Mars Planet Start Hub"
              onClick={onReturnHome}
              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Home size={16} />
            </button>
            <button
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </header>

        {/* Navigation Screen Tabs: Field console & Suit readings */}
        <nav aria-label="Mission tools" style={{ margin: '14px 0' }}>
          {screens.map(({ name, icon: Icon }, i) => (
            <button
              key={name}
              aria-current={screen === i ? 'page' : undefined}
              onClick={() => {
                setScreen(i);
                if (window.innerWidth < 760) setCollapsed(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </nav>

        {/* Mission Setup Section */}
        <section>
          <h2>Mission Setup</h2>
          <label>
            Mission Name
            <input
              maxLength={24}
              value={missionName}
              onChange={e => setMissionName(e.target.value)}
              onBlur={() => { if (!missionName.trim()) setMissionName('ARES-Gale'); }}
            />
          </label>
          <label>
            Mission Phase
            <input
              value={missionPhase}
              maxLength={26}
              onChange={e => setMissionPhase(e.target.value)}
            />
          </label>
          <label>
            Mission Type
            <select
              value={groupIndex}
              onChange={e => {
                setGroupIndex(+e.target.value);
                setTargetIndex(0);
                setScreen(0);
              }}
            >
              {catalog.map((g, i) => (
                <option key={g.name} value={i}>{g.name}</option>
              ))}
            </select>
          </label>
          <label>
            Science Objective
            <select
              value={targetIndex}
              onChange={e => {
                setTargetIndex(+e.target.value);
                setScreen(0);
              }}
            >
              {currentGroup.targets.map((t, i) => (
                <option key={t.name} value={i}>{t.name}</option>
              ))}
            </select>
          </label>
        </section>

        {/* Matching Sites Catalog (from catalog.json) */}
        <section>
          <h2>Matching Target Sites</h2>
          <p style={{ fontSize: '11px', color: '#cfb5ae', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            {currentTarget.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentTarget.sites.map(site => {
              const isSelected = destPoint.name?.includes(site.name);
              return (
                <button
                  className="field-site"
                  key={site.name}
                  onClick={() => handleSelectSite(site)}
                  style={{
                    backgroundColor: isSelected ? '#54272a' : '#2d1e20',
                    borderColor: isSelected ? '#ff9983' : '#604044',
                    padding: '8px 10px',
                    borderRadius: '5px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400, color: '#fff0e9' }}>
                    <MapPin size={13} color={isSelected ? '#ff9983' : '#cfb5ae'} />
                    {site.name}
                  </span>
                  <small style={{ fontSize: '11px', color: isSelected ? '#ffb2a2' : '#cfb5ae' }}>
                    {isSelected ? `Target selected · ${activeSummary?.total_distance_km ? activeSummary.total_distance_km.toFixed(2) + ' km' : 'Routed'}` : 'Click to route to site'}
                  </small>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: '#ff9983', fontFamily: "'IBM Plex Mono', monospace" }}>
            EVA Start: Curiosity Sol 4000 Station
          </div>
        </section>

        {/* Data Sources Modal Trigger */}
        <button
          className="sources-button"
          onClick={() => setSourcesOpen(true)}
          style={{
            marginTop: '20px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            backgroundColor: '#241819',
            border: '1px solid #623d40',
            color: '#cfb5ae',
            fontSize: '12px'
          }}
        >
          <Database size={14} color="#ff9983" />
          NASA Data Sources & Citations
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="field-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {collapsed && (
          <button
            className="rail-open"
            onClick={() => setCollapsed(false)}
            style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1200 }}
          >
            <PanelLeftOpen size={16} /> Mission Menu
          </button>
        )}

        {/* Tab 0: Field Console Map (Tactical Schematic Map with Merged Target Sites) */}
        {screen === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Top Workspace Header Bar */}
            <div style={{
              backgroundColor: '#160f10',
              borderBottom: '1px solid #543337',
              padding: '10px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#fff0e9',
                  letterSpacing: '0.5px'
                }}>
                  Gale Crater / Mount Sharp
                </span>

                <a
                  href="https://trek.nasa.gov/mars/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#241819',
                    border: '1px solid #ff9983',
                    borderRadius: '5px',
                    color: '#ff9983',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    letterSpacing: '0.5px'
                  }}
                >
                  <Orbit size={13} />
                  NASA MARS TREK (3D)
                </a>

                <span style={{
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#bfa79f',
                  backgroundColor: '#201516',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #4a2e31'
                }}>
                  Viking MDIM2.1 · 232m
                </span>

                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#4ade80',
                  backgroundColor: 'rgba(74, 222, 128, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  letterSpacing: '1px'
                }}>
                  ● LIVE GIS
                </span>
              </div>

              {/* Calculated Routes & PNR Indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#a8948f', fontFamily: "'IBM Plex Mono', monospace" }}>
                  CALCULATED ROUTES:
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#151210',
                  backgroundColor: '#34d399',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  ● P1: Balanced ({activeSummary?.total_distance_km ? activeSummary.total_distance_km.toFixed(2) + 'km' : '5.43km'})
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  ● P2: Flattest ({activeSummary?.total_distance_km ? (activeSummary.total_distance_km * 1.01).toFixed(2) + 'km' : '5.48km'})
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#60a5fa',
                  backgroundColor: 'rgba(96, 165, 250, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  ● P3: Max Clearance ({activeSummary?.total_distance_km ? (activeSummary.total_distance_km * 1.05).toFixed(2) + 'km' : '5.72km'})
                </span>

                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#f43f5e',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠ PNR: km 5.4 (Safe)
                </span>

                <button
                  onClick={onReturnHome}
                  style={{
                    backgroundColor: '#201516',
                    border: '1px solid #543337',
                    borderRadius: '5px',
                    color: '#ff9983',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Home size={14} />
                  Start Hub
                </button>
              </div>
            </div>

            {/* Merged Matching Target Sites HUD Strip */}
            <div style={{
              backgroundColor: '#1c1314',
              borderBottom: '1px solid #543337',
              padding: '10px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#ff9983" />
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff0e9',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase'
                  }}>
                    Matching Target Sites
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#ff9983',
                    backgroundColor: '#2a1618',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #623d40'
                  }}>
                    EVA Start: Curiosity Sol 4000 Station
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#cfb5ae', marginTop: '3px' }}>
                  {currentTarget.description || 'Survey accessible exposures and photograph the terrain.'}
                </div>
              </div>

              {/* Target Sites Quick Route Action Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {currentTarget.sites.map(site => {
                  const isSelected = destPoint.name?.includes(site.name);
                  return (
                    <button
                      key={site.name}
                      onClick={() => handleSelectSite(site)}
                      style={{
                        backgroundColor: isSelected ? '#54272a' : '#26181a',
                        border: `1px solid ${isSelected ? '#ff9983' : '#604044'}`,
                        borderRadius: '6px',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(255, 153, 131, 0.35)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color={isSelected ? '#ff9983' : '#cfb5ae'} />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? '#fff0e9' : '#e6d0cb'
                        }}>
                          {site.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: isSelected ? '#ffb2a2' : '#a8948f',
                        fontFamily: "'IBM Plex Mono', monospace"
                      }}>
                        {isSelected ? `Target Active · ${activeSummary?.total_distance_km ? activeSummary.total_distance_km.toFixed(2) + ' km' : 'Routed'}` : 'Click to route to site'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Schematic Map Directly Embedded */}
            <iframe
              ref={schematicFrame}
              title="Tactical Schematic Field Map"
              src="/field/index.html"
              onLoad={syncIframe}
              style={{ width: '100%', flex: 1, border: 0, minHeight: '650px' }}
            />
          </div>
        )}

        {/* Tab 1: Suit Telemetry Screen (100% Linked Life-Support & Bioenergetics) */}
        {screen === 1 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <SuitTelemetryView
              route={routeResult}
              activeOptionId={activeOptionId}
              transportMode={transportMode}
              telemetry={telemetry}
            />
          </div>
        )}
      </div>

      {/* Attribution / Data Sources Modal */}
      <AttributionModal isOpen={sourcesOpen} onClose={() => setSourcesOpen(false)} />
    </main>
  );
};

export default FieldWorkspace;
