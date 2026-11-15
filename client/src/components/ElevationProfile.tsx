import React, { useState } from 'react';
import { Mountain, TrendingUp, AlertTriangle } from 'lucide-react';
import { ElevationPoint } from '../types/api';

interface ElevationProfileProps {
  profile: ElevationPoint[];
  routeCoordinates?: [number, number][];
  onHoverCoord?: (coord: [number, number] | null) => void;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  profile,
  routeCoordinates = [],
  onHoverCoord
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!profile || profile.length < 2) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        color: '#64748b',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        Elevation cross-section will render upon traverse computation.
      </div>
    );
  }

  const elevs = profile.map(p => p.elevation_m);
  const slopes = profile.map(p => p.slope_deg);
  const maxDist = profile[profile.length - 1].distance_km;

  const minElev = Math.floor(Math.min(...elevs) - 15);
  const maxElev = Math.ceil(Math.max(...elevs) + 15);
  const elevRange = Math.max(1, maxElev - minElev);

  const maxSlope = Math.max(...slopes);

  // SVG Chart Dimensions
  const width = 800;
  const height = 140;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 15;
  const padBottom = 25;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Coordinate mapper
  const getX = (dist: number) => padLeft + (dist / Math.max(0.1, maxDist)) * chartW;
  const getY = (elev: number) => padTop + chartH - ((elev - minElev) / elevRange) * chartH;

  // Build SVG Path for Elevation Area
  const points = profile.map(p => `${getX(p.distance_km)},${getY(p.elevation_m)}`).join(' ');
  const areaPath = `M ${getX(0)},${padTop + chartH} ${points} L ${getX(maxDist)},${padTop + chartH} Z`;

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;
    
    if (svgX < padLeft || svgX > padLeft + chartW) {
      setHoverIndex(null);
      if (onHoverCoord) onHoverCoord(null);
      return;
    }

    const ratio = (svgX - padLeft) / chartW;
    const targetDist = ratio * maxDist;

    // Find nearest point
    let closestIdx = 0;
    let minDiff = Infinity;
    profile.forEach((p, idx) => {
      const diff = Math.abs(p.distance_km - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    if (onHoverCoord && routeCoordinates.length > 0) {
      const coordIdx = Math.min(
        Math.floor((closestIdx / (profile.length - 1)) * (routeCoordinates.length - 1)),
        routeCoordinates.length - 1
      );
      onHoverCoord(routeCoordinates[coordIdx]);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (onHoverCoord) onHoverCoord(null);
  };

  const activePoint = hoverIndex !== null ? profile[hoverIndex] : null;

  return (
    <div style={{
      backgroundColor: '#070a13',
      border: '1px solid #1e293b',
      borderRadius: '10px',
      padding: '14px 18px',
      position: 'relative'
    }}>
      {/* Chart Title and Live Hover Readout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mountain size={16} color="#f59e0b" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: '#f8fafc' }}>
            TERRAIN ELEVATION & SLOPE PROFILE
          </span>
        </div>

        {activePoint ? (
          <div style={{ display: 'flex', gap: '14px', fontSize: '11px', fontFamily: 'monospace' }}>
            <span style={{ color: '#38bdf8' }}>DIST: {activePoint.distance_km} km</span>
            <span style={{ color: '#f59e0b' }}>ELEV: {activePoint.elevation_m} m</span>
            <span style={{ color: activePoint.slope_deg > 15 ? '#ef4444' : '#10b981' }}>
              SLOPE: {activePoint.slope_deg}°
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            HOVER OVER PROFILE TO MAP TERRAIN COORDINATES
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padLeft} y1={padTop} x2={padLeft + chartW} y2={padTop} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padLeft} y1={padTop + chartH * 0.5} x2={padLeft + chartW} y2={padTop + chartH * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="#334155" />

        {/* Elevation Area */}
        <path d={areaPath} fill="url(#elevGradient)" />
        <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Axis Labels */}
        <text x={padLeft - 6} y={padTop + 8} fill="#64748b" fontSize="9" textAnchor="end">{maxElev}m</text>
        <text x={padLeft - 6} y={padTop + chartH * 0.5 + 3} fill="#64748b" fontSize="9" textAnchor="end">{Math.round((maxElev + minElev) / 2)}m</text>
        <text x={padLeft - 6} y={padTop + chartH} fill="#64748b" fontSize="9" textAnchor="end">{minElev}m</text>

        <text x={padLeft} y={height - 6} fill="#64748b" fontSize="9">0 km</text>
        <text x={padLeft + chartW * 0.5} y={height - 6} fill="#64748b" fontSize="9" textAnchor="middle">{(maxDist / 2).toFixed(1)} km</text>
        <text x={padLeft + chartW} y={height - 6} fill="#64748b" fontSize="9" textAnchor="end">{maxDist.toFixed(1)} km</text>

        {/* Active Hover Marker Line */}
        {activePoint && (
          <>
            <line
              x1={getX(activePoint.distance_km)}
              y1={padTop}
              x2={getX(activePoint.distance_km)}
              y2={padTop + chartH}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={getX(activePoint.distance_km)}
              cy={getY(activePoint.elevation_m)}
              r="4.5"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    </div>
  );
};
