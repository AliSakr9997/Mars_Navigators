import React from 'react';
import { TelemetryResponse, RouteResponse } from '../types/api';

interface TelemetryPanelProps {
  telemetry: TelemetryResponse | null;
  routeResult: RouteResponse | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry, routeResult }) => {
  // Real calculations based on route duration
  const evaHours = routeResult?.summary?.estimated_eva_time_hours || 
    (routeResult?.summary?.time_min ? routeResult.summary.time_min / 60 : 2.4);

  // Astronaut PLSS 8.0-hour primary life support oxygen consumption
  const calculatedOxygen = Math.max(12, Math.round(100 - (evaHours / 8.0) * 100));

  // Astronaut suit thermal & electronics battery draw (7.5-hour nominal rating)
  const calculatedBattery = Math.max(15, Math.round(100 - (evaHours / 7.5) * 100));

  // Metabolic energy calculated from Minetti walking cost in kJ
  const calculatedEnergy = routeResult?.summary?.energy_kj || 
    Math.round((routeResult?.summary?.total_distance_km || 3.12) * 310);

  // In-situ dosimeter radiation rate from Curiosity RAD
  const radRate = telemetry?.rad?.dose_rate_uSv_hour || 24.2;

  const cards = [
    {
      title: 'Ground temp. · min',
      val: telemetry?.rems?.diurnal_min_c !== undefined ? `${Math.round(telemetry.rems.diurnal_min_c)}` : '-84',
      unit: '°C'
    },
    {
      title: 'Pressure · REMS',
      val: telemetry?.rems?.pressure_pa ? `${Math.round(telemetry.rems.pressure_pa)}` : '777',
      unit: 'Pa'
    },
    {
      title: 'Air temp. · range',
      val: '−71 to −5',
      unit: '°C'
    },
    {
      title: 'UV index · REMS',
      val: telemetry?.rems?.uv_index || 'Moderate',
      unit: ''
    },
    {
      title: 'Radiation · RAD',
      val: `${radRate}`,
      unit: 'µSv/h'
    },
    {
      title: 'Oxygen · Calculated',
      val: `${calculatedOxygen}`,
      unit: '%'
    },
    {
      title: 'Suit battery · Calc.',
      val: `${calculatedBattery}`,
      unit: '%'
    },
    {
      title: 'Metabolic Energy',
      val: `${calculatedEnergy}`,
      unit: 'kJ'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{
          margin: 0,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '24px',
          fontWeight: 600,
          color: '#f2e7d8'
        }}>
          Surface telemetry
        </h2>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          color: '#bdb0a2',
          letterSpacing: '1px'
        }}>
          REMS IN-SITU &nbsp;/&nbsp; CALCULATED DYNAMICS
        </span>
      </div>

      {/* 8 Telemetry Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#201c19',
              border: '1px solid #623d40',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '85px'
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#bdb0a2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {c.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: c.val.length > 5 ? '20px' : '28px',
                fontWeight: 500,
                color: '#f2e7d8',
                lineHeight: 1
              }}>
                {c.val}
              </span>
              {c.unit && (
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  color: '#f1a16e'
                }}>
                  {c.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

