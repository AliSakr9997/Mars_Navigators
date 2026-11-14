import React, { useState, useEffect } from 'react';
import { Compass, ShieldAlert, Activity, Mountain, Navigation, Radio, MapPin, CheckCircle2 } from 'lucide-react';
import { RouteResponse, Waypoint } from './types/api';
import { generateMockRoute } from './utils/mockRoute';

const PRESET_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station' },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha' },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench' },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven' },
];

export default function App() {
  const [startPoint, setStartPoint] = useState<Waypoint>(PRESET_WAYPOINTS[0]);
  const [destPoint, setDestPoint] = useState<Waypoint>(PRESET_WAYPOINTS[1]);
  const [routeMode, setRouteMode] = useState<'safe' | 'direct'>('safe');
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/route/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startPoint,
          destination: destPoint,
          mode: routeMode,
          max_slope_deg: 15.0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Offline fallback
      const fallback = generateMockRoute({
        start: startPoint,
        destination: destPoint,
        mode: routeMode,
        max_slope_deg: 15.0
      });
      setRouteResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, [startPoint, destPoint, routeMode]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f1f5f9', padding: '24px', boxSizing: 'border-box' }}>
      {/* Top Mission Control Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass color="#f59e0b" size={28} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '1px', color: '#f8fafc' }}>
              ARES-GALE <span style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 600 }}>// MISSION CONTROL</span>
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
            Gale Crater — Lower Mount Sharp — Boxwork Formations | NASA Space Apps Challenge 2026
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', fontSize: '12px' }}>
            <span style={{ color: '#10b981', marginRight: '6px' }}>●</span>COMMS: NOMINAL (ORBITER LINK)
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: '#38bdf8' }}>
            SOL: 4000
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Telemetry Panel */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#38bdf8' }}>
            <Activity size={20} />
            <h2 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Curiosity In-Situ Telemetry</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>GROUND TEMP (REMS)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>2.1 °C</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Diurnal Min: -74.2 °C</div>
            </div>
            <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>ATMOSPHERE (REMS)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>828.5 Pa</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Wind: 4.2 m/s NW</div>
            </div>
            <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>RADIATION (RAD)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>0.67 <span style={{ fontSize: '12px' }}>mSv/day</span></div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Nominal Solar Quiet</div>
            </div>
            <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>SAFE EVA WINDOW</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>8.5 <span style={{ fontSize: '12px' }}>HOURS</span></div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Cosmic ray limit</div>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#64748b', marginTop: '12px', lineHeight: 1.4 }}>
            * REMS and RAD data represent in-situ point measurements from Curiosity rover at Mount Sharp baseline.
          </p>
        </div>

        {/* Route Planner Setup */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#f59e0b' }}>
            <Navigation size={20} />
            <h2 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EVA Traverse Planner</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>START WAYPOINT</label>
              <select 
                value={startPoint.name}
                onChange={(e) => setStartPoint(PRESET_WAYPOINTS.find(p => p.name === e.target.value) || PRESET_WAYPOINTS[0])}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#090d16', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' }}
              >
                {PRESET_WAYPOINTS.map(p => (
                  <option key={p.name} value={p.name}>{p.name} ({p.lat}, {p.lng})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>DESTINATION (BOXWORK TARGET)</label>
              <select 
                value={destPoint.name}
                onChange={(e) => setDestPoint(PRESET_WAYPOINTS.find(p => p.name === e.target.value) || PRESET_WAYPOINTS[1])}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#090d16', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' }}
              >
                {PRESET_WAYPOINTS.map(p => (
                  <option key={p.name} value={p.name}>{p.name} ({p.lat}, {p.lng})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={() => setRouteMode('safe')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                  backgroundColor: routeMode === 'safe' ? '#f59e0b' : '#1e293b',
                  color: routeMode === 'safe' ? '#090d16' : '#94a3b8'
                }}
              >
                SAFE ROUTE (SLOPE &lt; 15°)
              </button>
              <button 
                onClick={() => setRouteMode('direct')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                  backgroundColor: routeMode === 'direct' ? '#38bdf8' : '#1e293b',
                  color: routeMode === 'direct' ? '#090d16' : '#94a3b8'
                }}
              >
                DIRECT ROUTE
              </button>
            </div>
          </div>
        </div>

        {/* Route Summary Results */}
        {routeResult && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <CheckCircle2 size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', letterSpacing: '0.5px' }}>TRAVERSE COMPUTED: {routeResult.metadata.algorithm}</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#f59e0b', backgroundColor: '#451a03', padding: '4px 10px', borderRadius: '6px' }}>
                STATUS: {routeResult.summary.hazard_level}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>TOTAL DISTANCE</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{routeResult.summary.total_distance_km} km</div>
              </div>
              <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>ESTIMATED EVA TIME</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>{routeResult.summary.estimated_eva_time_hours} hrs</div>
              </div>
              <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>MAX SLOPE</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{routeResult.summary.max_slope_deg}°</div>
              </div>
              <div style={{ backgroundColor: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>ELEVATION GAIN</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>+{routeResult.summary.elevation_gain_m} m</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {routeResult.traversed_geology.map(geo => (
                <span key={geo.unit} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#cbd5e1' }}>
                  {geo.unit}: <strong style={{ color: '#f59e0b' }}>{geo.percent}%</strong>
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
