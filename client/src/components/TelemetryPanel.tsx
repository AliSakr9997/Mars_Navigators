import React from 'react';
import { Activity, ShieldAlert, Layers, Target, CheckSquare, Square, Thermometer, Gauge, Radiation } from 'lucide-react';
import { TelemetryResponse, Waypoint } from '../types/api';

interface TelemetryPanelProps {
  telemetry: TelemetryResponse | null;
  waypoints: Waypoint[];
  startPoint: Waypoint;
  destPoint: Waypoint;
  onSelectStart: (wp: Waypoint) => void;
  onSelectDestination: (wp: Waypoint) => void;
  showGeology: boolean;
  setShowGeology: (val: boolean) => void;
  showHazards: boolean;
  setShowHazards: (val: boolean) => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetry,
  waypoints,
  startPoint,
  destPoint,
  onSelectStart,
  onSelectDestination,
  showGeology,
  setShowGeology,
  showHazards,
  setShowHazards
}) => {
  const [objectives, setObjectives] = React.useState([
    { id: 1, text: "Traverse from Sol 4000 to Boxwork ridges", done: true },
    { id: 2, text: "Survey cemented fracture network veins", done: true },
    { id: 3, text: "Inspect Sulfate-Clay transitional strata", done: false },
    { id: 4, text: "Avoid high-slip Bagnold dune field", done: true },
    { id: 5, text: "Maintain slope < 15° for EVA suit mobility", done: true }
  ]);

  const toggleObjective = (id: number) => {
    setObjectives(objs => objs.map(o => o.id === id ? { ...o, done: !o.done } : o));
  };

  const rems = telemetry?.rems;
  const rad = telemetry?.rad;

  return (
    <div style={{
      width: '320px',
      backgroundColor: '#0a0f1d',
      borderRight: '1px solid #1e293b',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      {/* 1. In-Situ Telemetry Card */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#38bdf8' }}>
          <Activity size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            In-Situ Rover Telemetry (MSL)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Ground Temp */}
          <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '10px' }}>
              <Thermometer size={12} color="#f59e0b" />
              GROUND TEMP
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
              {rems ? `${rems.ground_temp_c}°C` : '2.1°C'}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Min: -74.2°C</div>
          </div>

          {/* Pressure */}
          <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '10px' }}>
              <Gauge size={12} color="#38bdf8" />
              PRESSURE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
              {rems ? `${rems.pressure_pa} Pa` : '828.5 Pa'}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Wind: 4.2 m/s</div>
          </div>

          {/* Radiation */}
          <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '10px' }}>
              <Radiation size={12} color="#10b981" />
              RAD DOSE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginTop: '2px', fontFamily: 'monospace' }}>
              {rad ? `${rad.dose_rate_mSv_day}` : '0.67'} <span style={{ fontSize: '10px' }}>mSv/d</span>
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Solar Quiet</div>
          </div>

          {/* Safe Window */}
          <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '10px' }}>
              <ShieldAlert size={12} color="#f59e0b" />
              EVA WINDOW
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginTop: '2px', fontFamily: 'monospace' }}>
              {rad ? `${rad.cumulative_eva_allowed_hours}h` : '8.5h'}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Cosmic limit</div>
          </div>
        </div>
      </div>

      {/* 2. Map Layer Switcher */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#f59e0b' }}>
          <Layers size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Geospatial Data Layers
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={showGeology}
              onChange={(e) => setShowGeology(e.target.checked)}
              style={{ accentColor: '#f59e0b' }}
            />
            <span>USGS / CRISM Geology Strata</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={showHazards}
              onChange={(e) => setShowHazards(e.target.checked)}
              style={{ accentColor: '#ef4444' }}
            />
            <span>Bagnold Dune Hazard Mask</span>
          </label>
        </div>
      </div>

      {/* 3. Preset Waypoints Quick Navigation */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#38bdf8' }}>
          <Target size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Scientific Waypoints
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {waypoints.map(wp => {
            const isStart = wp.name === startPoint.name;
            const isDest = wp.name === destPoint.name;

            return (
              <div
                key={wp.name}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  backgroundColor: isStart ? '#064e3b' : (isDest ? '#7f1d1d' : '#0d1527'),
                  border: isStart ? '1px solid #10b981' : (isDest ? '1px solid #ef4444' : '1px solid #1e293b'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectDestination(wp)}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{wp.name}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                    {wp.lat.toFixed(4)}°, {wp.lng.toFixed(4)}°
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectStart(wp); }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '9px',
                      borderRadius: '3px',
                      backgroundColor: isStart ? '#22c55e' : '#1e293b',
                      color: isStart ? '#000' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    START
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectDestination(wp); }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '9px',
                      borderRadius: '3px',
                      backgroundColor: isDest ? '#ef4444' : '#1e293b',
                      color: isDest ? '#fff' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    GOAL
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Science Checklist */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px',
        flex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#10b981' }}>
          <CheckSquare size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Mission Scientific Protocol
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {objectives.map(obj => (
            <div
              key={obj.id}
              onClick={() => toggleObjective(obj.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '11px',
                color: obj.done ? '#94a3b8' : '#e2e8f0',
                textDecoration: obj.done ? 'line-through' : 'none',
                cursor: 'pointer',
                lineHeight: 1.3
              }}
            >
              {obj.done ? (
                <CheckSquare size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <Square size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <span>{obj.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
