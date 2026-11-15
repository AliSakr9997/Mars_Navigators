import React, { useState } from 'react';
import { ElevationPoint } from '../types/api';

interface ElevationProfileProps {
  profile?: ElevationPoint[];
  elevationProfile?: ElevationPoint[];
  routeCoordinates?: [number, number][];
  onHoverCoord?: (coord: [number, number] | null) => void;
  onHoverPoint?: (coord: [number, number] | null) => void;
  maxSlopeDeg?: number;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  profile,
  elevationProfile,
  routeCoordinates = [],
  onHoverCoord,
  onHoverPoint,
  maxSlopeDeg = 20
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const triggerHover = onHoverPoint || onHoverCoord;

  // Fallback default points if route not yet computed
  const defaultProfile: ElevationPoint[] = [
    { distance_km: 0.0, elevation_m: -4462, slope_deg: 4.2 },
    { distance_km: 0.8, elevation_m: -4380, slope_deg: 9.8 },
    { distance_km: 1.6, elevation_m: -4290, slope_deg: 14.5 },
    { distance_km: 2.3, elevation_m: -4210, slope_deg: 18.2 },
    { distance_km: 3.12, elevation_m: -4153, slope_deg: 6.5 }
  ];

  const inputData = elevationProfile || profile;
  const activeData = inputData && inputData.length > 1 ? inputData : defaultProfile;

  const elevs = activeData.map(p => p.elevation_m);
  const slopes = activeData.map(p => p.slope_deg);
  const maxDist = activeData[activeData.length - 1].distance_km;

  const minElev = Math.floor(Math.min(...elevs) - 20);
  const maxElev = Math.ceil(Math.max(...elevs) + 20);
  const elevRange = Math.max(1, maxElev - minElev);

  const width = 560;
  const height = 240;
  const padLeft = 55;
  const padRight = 50;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (dist: number) => padLeft + (dist / Math.max(0.1, maxDist)) * chartW;
  const getY = (elev: number) => padTop + chartH - ((elev - minElev) / elevRange) * chartH;
  const getSlopeY = (slope: number) => padTop + chartH - (Math.min(30, slope) / 30) * chartH;

  const elevPoints = activeData.map(p => `${getX(p.distance_km)},${getY(p.elevation_m)}`).join(' ');
  const areaPath = `M ${getX(0)},${padTop + chartH} ${elevPoints} L ${getX(maxDist)},${padTop + chartH} Z`;
  const slopePoints = activeData.map(p => `${getX(p.distance_km)},${getSlopeY(p.slope_deg)}`).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    if (svgX < padLeft || svgX > padLeft + chartW) {
      setHoverIndex(null);
      if (triggerHover) triggerHover(null);
      return;
    }

    const ratio = (svgX - padLeft) / chartW;
    const targetDist = ratio * maxDist;

    let closestIdx = 0;
    let minDiff = Infinity;
    activeData.forEach((p, idx) => {
      const diff = Math.abs(p.distance_km - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    if (triggerHover && routeCoordinates.length > 0) {
      const coordIdx = Math.min(
        Math.floor((closestIdx / (activeData.length - 1)) * (routeCoordinates.length - 1)),
        routeCoordinates.length - 1
      );
      triggerHover(routeCoordinates[coordIdx]);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    if (triggerHover) triggerHover(null);
  };

  const currentHover = hoverIndex !== null ? activeData[hoverIndex] : null;

  return (
    <div style={{
      backgroundColor: '#201c19',
      border: '1px solid #443a33',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Title & Legend */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 600,
            color: '#f2e7d8'
          }}>
            Elevation profile
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#38bdf8' }} />
              <span style={{ color: '#bdb0a2' }}>Elevation (m)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#f1a16e' }} />
              <span style={{ color: '#bdb0a2' }}>Slope (°)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#73463d', borderRadius: '2px' }} />
              <span style={{ color: '#bdb0a2' }}>Over limit</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: '100%', overflow: 'visible', cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padTop + chartH * pct;
              const elevVal = Math.round(maxElev - pct * elevRange);
              const slopeVal = Math.round((1 - pct) * 20);
              return (
                <g key={i}>
                  <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#332922" strokeDasharray="3 3" />
                  <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="#8c7d70" fontSize="11" fontFamily="'IBM Plex Mono', monospace">
                    {elevVal}
                  </text>
                  <text x={padLeft + chartW + 8} y={y + 4} textAnchor="start" fill="#f1c680" fontSize="11" fontFamily="'IBM Plex Mono', monospace">
                    {slopeVal}°
                  </text>
                </g>
              );
            })}

            {/* Shaded Area */}
            <path d={areaPath} fill="rgba(56, 189, 248, 0.12)" />

            {/* Elevation Line */}
            <path d={`M ${getX(0)},${getY(activeData[0].elevation_m)} ${elevPoints}`} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Slope Line */}
            <path d={`M ${getX(0)},${getSlopeY(activeData[0].slope_deg)} ${slopePoints}`} fill="none" stroke="#f1a16e" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* X-Axis Ticks */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const x = padLeft + chartW * pct;
              const distVal = (pct * maxDist).toFixed(1);
              return (
                <text key={i} x={x} y={padTop + chartH + 20} textAnchor="middle" fill="#8c7d70" fontSize="11" fontFamily="'IBM Plex Mono', monospace">
                  {distVal}
                </text>
              );
            })}

            {/* Hover Cursor and Value Tooltip */}
            {hoverIndex !== null && currentHover && (
              <g>
                <line
                  x1={getX(currentHover.distance_km)}
                  y1={padTop}
                  x2={getX(currentHover.distance_km)}
                  y2={padTop + chartH}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(currentHover.distance_km)}
                  cy={getY(currentHover.elevation_m)}
                  r="5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Footnote */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #332922',
        fontSize: '13px',
        color: '#bdb0a2'
      }}>
        <span>Distance along route (km)</span>
        <span style={{ color: '#8c7d70' }}>Inspect profile to locate a point on the map</span>
      </div>
    </div>
  );
};
