import React from 'react';
import { Waypoint } from '../types/api';
import { Crosshair, ChevronDown, Plus, Minus, Zap, Shield, Compass } from 'lucide-react';

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
  loading
}) => {
  const modes = [
    { id: 'Balanced', label: 'Safe EVA', risk: '14%', color: '#f1a16e' },
    { id: 'Shortest distance', label: 'Direct / Quick Return', risk: '44%', color: '#f1c680' },
    { id: 'Safest (max clearance)', label: 'Ridge traverse', risk: '45%', color: '#d5a39d' }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '26px',
            fontWeight: 600,
            color: '#f2e7d8'
          }}>
            Route planner
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1c680' }} />
            <span style={{ fontSize: '13px', color: '#f1c680' }}>
              Online
            </span>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332922', marginBottom: '16px' }} />

        {/* Start Point Picker */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            START
          </label>
          <div style={{
            position: 'relative',
            backgroundColor: '#302923',
            border: '1px solid #443a33',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1a16e', flexShrink: 0 }} />
              <select
                value={start.name}
                onChange={(e) => {
                  const found = waypoints.find(w => w.name === e.target.value);
                  if (found) onSelectStart(found);
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f2e7d8',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {waypoints.map(w => (
                  <option key={w.name} value={w.name} style={{ backgroundColor: '#211c18', color: '#f2e7d8' }}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ color: '#f1a16e', fontSize: '16px', marginLeft: '6px' }}>⌖</span>
          </div>
        </div>

        {/* Target Point Picker */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            TARGET
          </label>
          <div style={{
            position: 'relative',
            backgroundColor: '#302923',
            border: '1px solid #443a33',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1c680', flexShrink: 0 }} />
              <select
                value={destination.name}
                onChange={(e) => {
                  const found = waypoints.find(w => w.name === e.target.value);
                  if (found) onSelectDestination(found);
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f2e7d8',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {waypoints.map(w => (
                  <option key={w.name} value={w.name} style={{ backgroundColor: '#211c18', color: '#f2e7d8' }}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ color: '#f1a16e', fontSize: '16px', marginLeft: '6px' }}>⌖</span>
          </div>
        </div>

        {/* Preset Waypoints Quick Select */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            PRESET WAYPOINTS
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {waypoints.slice(0, 3).map(wp => (
              <button
                key={wp.name}
                onClick={() => onSelectDestination(wp)}
                style={{
                  backgroundColor: '#201c19',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#f2e7d8',
                  fontSize: '13px',
                  padding: '4px 0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ color: '#f1a16e' }}>↗</span>
                <span style={{ textDecoration: destination.name === wp.name ? 'underline' : 'none' }}>
                  {wp.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '16px' }} />

        {/* Routing Mode / Alternatives */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2',
              letterSpacing: '1px'
            }}>
              ROUTING MODE / ALTERNATIVES
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#bdb0a2'
            }}>
              RISK %
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {modes.map(m => {
              const active = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  style={{
                    backgroundColor: active ? '#433329' : '#201c19',
                    border: active ? '1px solid #9b6947' : '1px solid transparent',
                    borderRadius: '5px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: `1px solid ${m.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {active && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: m.color }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#f2e7d8' : '#bdb0a2'
                    }}>
                      {m.label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '14px',
                    fontWeight: 500,
                    color: m.color
                  }}>
                    {m.risk}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Maximum Allowed Slope Adjustment */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#bdb0a2',
            letterSpacing: '1px'
          }}>
            MAXIMUM ALLOWED SLOPE
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onChangeMaxSlope(Math.max(10, maxSlopeDeg - 1))}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#302923',
                border: '1px solid #443a33',
                borderRadius: '6px',
                color: '#f2e7d8',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              −
            </button>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 500,
              color: '#f2e7d8',
              minWidth: '36px',
              textAlign: 'center'
            }}>
              {maxSlopeDeg}°
            </span>
            <button
              onClick={() => onChangeMaxSlope(Math.min(35, maxSlopeDeg + 1))}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#302923',
                border: '1px solid #443a33',
                borderRadius: '6px',
                color: '#f2e7d8',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button
            onClick={onComputeRoute}
            disabled={loading}
            style={{
              flex: 1.4,
              backgroundColor: '#f1a16e',
              border: '1px solid #f1a16e',
              borderRadius: '6px',
              height: '36px',
              color: '#151210',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Computing...' : 'Compute Route'}
          </button>
          <button
            onClick={onClearRoute}
            style={{
              flex: 1,
              backgroundColor: '#302923',
              border: '1px solid #443a33',
              borderRadius: '6px',
              height: '36px',
              color: '#f2e7d8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Route
          </button>
        </div>
      </div>

      {/* Footer Notes */}
      <div style={{ borderTop: '1px solid #332922', paddingTop: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#f1c680', marginBottom: '4px' }}>
          Local model · EVA simulation
        </div>
        <div style={{ fontSize: '12px', color: '#8c7d70', lineHeight: 1.4 }}>
          Risk percentages use illustrative terrain and sample inputs.
        </div>
      </div>
    </div>
  );
};
