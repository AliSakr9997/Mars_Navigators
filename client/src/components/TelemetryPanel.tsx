import React from 'react';
import { TelemetryResponse } from '../types/api';

interface TelemetryPanelProps {
  telemetry: TelemetryResponse | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry }) => {
  const cards = [
    {
      title: 'Ground temp. · min',
      val: '-84',
      unit: '°C'
    },
    {
      title: 'Pressure · REMS',
      val: telemetry?.rems?.pressure_pa ? `${Math.round(telemetry.rems.pressure_pa)}` : '777',
      unit: 'Pa'
    },
    {
      title: 'Wind speed',
      val: '—',
      unit: 'no data'
    },
    {
      title: 'UV index',
      val: 'Moderate',
      unit: ''
    },
    {
      title: 'Radiation dose',
      val: '—',
      unit: 'no data'
    },
    {
      title: 'Oxygen · SIM',
      val: '84',
      unit: '%'
    },
    {
      title: 'Suit battery · SIM',
      val: '72',
      unit: '%'
    },
    {
      title: 'Base distance · SIM',
      val: '1.6',
      unit: 'km'
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
          REMS &nbsp;/&nbsp; EVA SIM
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
              border: '1px solid #443a33',
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
