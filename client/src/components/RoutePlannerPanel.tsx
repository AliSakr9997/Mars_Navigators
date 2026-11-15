import React from 'react';
import { Waypoint, RouteResponse, TransportMode } from '../types/api';
import { Crosshair, ChevronDown, Plus, Minus, Zap, Shield, Compass, RotateCcw, AlertTriangle, Battery, Wind } from 'lucide-react';

interface RoutePlannerPanelProps {
  start: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[];
  onSelectStart: (wp: Waypoint) => void;
  onSelectDestination: (wp: Waypoint) => void;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  maxSlopeDeg: number;
  onChangeMaxSlope: (slope: number) => void;
  onComputeRoute: () => void;
  onClearRoute: () => void;
  loading: boolean;
  routeResult: RouteResponse | null;
  transportMode: TransportMode;
  onSelectTransportMode: (mode: TransportMode) => void;
  pickMode: 'start' | 'dest' | null;
  onSetPickMode: (mode: 'start' | 'dest' | null) => void;
}

export const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
  start,
  destination,
  waypoints,
  onSelectStart,
  onSelectDestination,
  selectedMode,
  onSelectMode,
  maxSlopeDeg,
  onChangeMaxSlope,
  onComputeRoute,
  onClearRoute,
  loading,
  routeResult,
  transportMode,
  onSelectTransportMode,
  pickMode,
  onSetPickMode
}) => {
  const modes = [
    { id: 'Balanced', label: 'Balanced (P1)', risk: '14%', color: '#10b981', desc: 'Optimal terrain & slope' },
    { id: 'Min slope', label: 'Flattest (P2)', risk: '18%', color: '#f59e0b', desc: 'Avoids steep ridges' },
    { id: 'Safest (max clearance)', label: 'Max Clearance (P3)', risk: '10%', color: '#06b6d4', desc: 'Maximum hazard buffer' }
  ];

  return (
    <div style={{
      backgroundColor: '#201c19',
      border: '1px solid #443a33',
      borderRadius: '12px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#f2e7d8'
            }}>
              Route planner
            </h2>
            <div style={{ fontSize: '12px', color: '#bdb0a2' }}>
              Multi-Model A* Surface Router
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              Live GIS
            </span>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332922', marginBottom: '14px' }} />

        {/* Phase 5: Transportation Mode Selector Pill */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            EXPLORATION MODE
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#181412',
            border: '1px solid #443a33',
            borderRadius: '6px',
            padding: '3px',
            gap: '4px'
          }}>
            <button
              onClick={() => onSelectTransportMode('walking')}
              style={{
                backgroundColor: transportMode === 'walking' ? '#f1a16e' : 'transparent',
                color: transportMode === 'walking' ? '#151210' : '#bdb0a2',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span>🚶</span>
              <span>Astronaut Walking</span>
            </button>

            <button
              onClick={() => onSelectTransportMode('rover')}
              style={{
                backgroundColor: transportMode === 'rover' ? '#f1a16e' : 'transparent',
                color: transportMode === 'rover' ? '#151210' : '#bdb0a2',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span>🚙</span>
              <span>Pressurized Rover</span>
            </button>
          </div>
        </div>

        {/* Phase 3: Start Point Picker with Map-Click Button */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2',
              letterSpacing: '1px'
            }}>
              START COORDINATE
            </label>
            <button
              onClick={() => onSetPickMode(pickMode === 'start' ? null : 'start')}
              style={{
                backgroundColor: pickMode === 'start' ? '#f1a16e' : '#302923',
                color: pickMode === 'start' ? '#151210' : '#f1a16e',
                border: '1px solid #7c4c31',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Crosshair size={12} />
              <span>{pickMode === 'start' ? 'Click Map...' : 'Pick on Map'}</span>
            </button>
          </div>

          <div style={{
            position: 'relative',
            backgroundColor: '#302923',
            border: pickMode === 'start' ? '1px solid #f1a16e' : '1px solid #443a33',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1a16e', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f2e7d8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {start.name || `Lat: ${start.lat.toFixed(4)}°, Lng: ${start.lng.toFixed(4)}°`}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>
                  {start.lat.toFixed(4)}°, {start.lng.toFixed(4)}° · Elev: {start.elevation_m || -4462}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3: Destination Point Picker with Map-Click Button */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2',
              letterSpacing: '1px'
            }}>
              TARGET COORDINATE
            </label>
            <button
              onClick={() => onSetPickMode(pickMode === 'dest' ? null : 'dest')}
              style={{
                backgroundColor: pickMode === 'dest' ? '#f1c680' : '#302923',
                color: pickMode === 'dest' ? '#151210' : '#f1c680',
                border: '1px solid #7c4c31',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Crosshair size={12} />
              <span>{pickMode === 'dest' ? 'Click Map...' : 'Pick on Map'}</span>
            </button>
          </div>

          <div style={{
            position: 'relative',
            backgroundColor: '#302923',
            border: pickMode === 'dest' ? '1px solid #f1c680' : '1px solid #443a33',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1c680', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f2e7d8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {destination.name || `Lat: ${destination.lat.toFixed(4)}°, Lng: ${destination.lng.toFixed(4)}°`}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#bdb0a2' }}>
                  {destination.lat.toFixed(4)}°, {destination.lng.toFixed(4)}° · Elev: {destination.elevation_m || -4120}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Waypoint Shortcuts */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2',
              letterSpacing: '1px'
            }}>
              GALE SCIENCE STATIONS
            </label>
            <span style={{ fontSize: '10px', color: '#887b70' }}>Click to target</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {waypoints.slice(0, 3).map(wp => {
              const isSelected = destination.name === wp.name;
              return (
                <button
                  key={wp.name}
                  onClick={() => onSelectDestination(wp)}
                  style={{
                    backgroundColor: isSelected ? '#332920' : '#251f1c',
                    border: isSelected ? '1px solid #f1c680' : '1px solid #332922',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isSelected ? '#f1c680' : '#887b70' }} />
                    <span style={{ fontSize: '12px', color: isSelected ? '#f2e7d8' : '#bdb0a2' }}>
                      {wp.name}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#887b70' }}>
                    {wp.elevation_m}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Routing Profile Strategy Pills */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            OPTIMIZATION STRATEGY
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                style={{
                  flex: 1,
                  backgroundColor: selectedMode === mode.id ? '#312923' : '#251f1c',
                  border: selectedMode === mode.id ? `1px solid ${mode.color}` : '1px solid #443a33',
                  borderRadius: '5px',
                  padding: '7px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{
                  fontSize: '11px',
                  fontWeight: selectedMode === mode.id ? 700 : 500,
                  color: selectedMode === mode.id ? '#f2e7d8' : '#bdb0a2',
                  textAlign: 'center'
                }}>
                  {mode.label}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  color: mode.color
                }}>
                  Risk: {mode.risk}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Max Slope Incline Slider */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2',
              letterSpacing: '1px'
            }}>
              MAX INCLINE LIMIT
            </label>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 600, color: '#f1a16e' }}>
              {maxSlopeDeg}°
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={maxSlopeDeg}
            onChange={(e) => onChangeMaxSlope(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#f1a16e',
              backgroundColor: '#302923',
              height: '5px',
              borderRadius: '3px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#887b70', marginTop: '2px' }}>
            <span>10° (Conservative)</span>
            <span>18° (Hard limit)</span>
            <span>30° (Extreme)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Compute & Clear */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onComputeRoute}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#6b4c37' : '#f1a16e',
            color: '#151210',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 18px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(241, 161, 110, 0.25)',
            transition: 'all 0.15s'
          }}
        >
          <Compass size={17} />
          <span>{loading ? 'COMPUTING A* ROUTE…' : 'COMPUTE MARS ROUTE'}</span>
        </button>

        <button
          onClick={onClearRoute}
          style={{
            backgroundColor: 'transparent',
            color: '#bdb0a2',
            border: '1px solid #443a33',
            borderRadius: '6px',
            padding: '7px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={13} />
          <span>Reset to Default Mission</span>
        </button>
      </div>
    </div>
  );
};
