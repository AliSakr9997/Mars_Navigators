import React from 'react';
import { Waypoint, RouteResponse, RouteOption } from '../types/api';
import { Crosshair, ChevronDown, Plus, Minus, Zap, Shield, Compass, Sparkles, AlertTriangle } from 'lucide-react';

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
  route?: RouteResponse | null;
  onSelectOption?: (optionId: string) => void;
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
  route,
  onSelectOption
}) => {
  const modes = [
    { id: 'Balanced', label: 'P1: Balanced EVA (Best)', risk: '12%', color: '#00e676' },
    { id: 'Flattest', label: 'P2: Flattest / Low Climb', risk: '8%', color: '#f59e0b' },
    { id: 'Safest (max clearance)', label: 'P3: Max Hazard Clearance', risk: '18%', color: '#06b6d4' }
  ];

  const activeOptionId = route?.activeOptionId || 'P1';
  const activeOpt = route?.options?.find(o => o.id === activeOptionId) || route?.options?.[0];

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
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00e676' }} />
            <span style={{ fontSize: '13px', color: '#00e676', fontWeight: 600 }}>
              ARES v5 Engine
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
            START WAYPOINT
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
            TARGET WAYPOINT
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
            QUICK TARGETS (GALE CRATER)
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
                  color: destination.name === wp.name ? '#f1a16e' : '#f2e7d8',
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

        {/* Multi-Candidate Route Selection (from Omar's Planner) */}
        {route?.options && route.options.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#bdb0a2',
                letterSpacing: '1px'
              }}>
                SELECT CANDIDATE ROUTE (3 OPTIONS)
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#bdb0a2'
              }}>
                LENGTH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {route.options.map(opt => {
                const active = opt.id === activeOptionId;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectOption && onSelectOption(opt.id)}
                    style={{
                      backgroundColor: active ? '#2c241e' : '#201c19',
                      border: active ? `1px solid ${opt.color}` : '1px solid #332822',
                      borderRadius: '6px',
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
                        border: `1px solid ${opt.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {active && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: opt.color }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#ffffff' : '#f2e7d8'
                      }}>
                        {opt.title}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 500,
                      color: opt.color
                    }}>
                      {opt.summary.total_distance_km} km
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic "Why this route?" Explanation Box */}
            {activeOpt && (
              <div style={{
                backgroundColor: '#181412',
                border: `1px solid ${activeOpt.color}`,
                borderRadius: '8px',
                padding: '10px 12px',
                marginTop: '10px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: activeOpt.color,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Sparkles size={12} />
                  <span>WHY THIS ROUTE?</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#f2e7d8',
                  marginTop: '4px',
                  lineHeight: 1.4
                }}>
                  {activeOpt.why}
                </div>
              </div>
            )}

            {/* Point of No Return (PNR) Safety Indicator */}
            {activeOpt?.pnr && (
              <div style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                padding: '10px 12px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#d8b4fe',
                    fontWeight: 600
                  }}>
                    POINT OF NO RETURN (PNR)
                  </div>
                  <div style={{ fontSize: '12px', color: '#f2e7d8', marginTop: '2px' }}>
                    Turn-around at <b>km {activeOpt.pnr.km.toFixed(1)}</b> of {activeOpt.summary.total_distance_km} km
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: activeOpt.pnr.safe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: activeOpt.pnr.safe ? '#10b981' : '#f87171'
                }}>
                  {activeOpt.pnr.safe ? 'SAFE RETURN' : 'CAUTION'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Maximum Allowed Slope Adjustment */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          marginTop: '12px'
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
              height: '38px',
              color: '#151210',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.8px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(241, 161, 110, 0.3)'
            }}
          >
            {loading ? 'CALCULATING 3 ROUTES...' : 'FIND PATHS (3 ROUTES) →'}
          </button>
          <button
            onClick={onClearRoute}
            style={{
              flex: 1,
              backgroundColor: '#302923',
              border: '1px solid #443a33',
              borderRadius: '6px',
              height: '38px',
              color: '#f2e7d8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Footer Notes */}
      <div style={{ borderTop: '1px solid #332922', paddingTop: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#f1c680', marginBottom: '4px' }}>
          NASA JPL / USGS Mars Models
        </div>
        <div style={{ fontSize: '12px', color: '#8c7d70', lineHeight: 1.4 }}>
          Calculates Best + Alternative paths with Tobler walking speed, Minetti metabolic energy, and Point of No Return.
        </div>
      </div>
    </div>
  );
};
