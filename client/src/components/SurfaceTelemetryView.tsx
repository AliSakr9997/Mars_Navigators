import React from 'react';
import { Radio, CloudRain, Sun, Thermometer, Wind, ShieldAlert, Compass, Clock, MapPin } from 'lucide-react';
import { TelemetryResponse } from '../types/api';

interface SurfaceTelemetryViewProps {
  telemetry: TelemetryResponse | null;
}

export const SurfaceTelemetryView: React.FC<SurfaceTelemetryViewProps> = ({ telemetry }) => {
  const rems = telemetry?.rems;
  const rad = telemetry?.rad;

  return (
    <div style={{
      padding: '24px 32px',
      color: '#fff0e9',
      fontFamily: "'Inter', system-ui, sans-serif",
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #543337',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#ff9983',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            NASA CURIOSITY ROVER // REMS METEOROLOGICAL STATION
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            margin: '4px 0 0 0',
            letterSpacing: '0.5px'
          }}>
            SURFACE TELEMETRY & ATMOSPHERIC SCIENCE
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#241819',
            border: '1px solid #623d40',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#c0c8a1'
          }}>
            SOL {rems?.sol ?? 4995} OBSERVATION
          </div>
        </div>
      </div>

      {/* Main Meteorological Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Atmospheric Pressure */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Surface Pressure</span>
            <Wind size={18} color="#ff9983" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {rems?.pressure_pa ?? 777}
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>Pa (7.77 mbar)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cfb5ae' }}>
            5.83 Torr · Gale Crater Basin Depression
          </div>
        </div>

        {/* Ambient Air Temp */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Ambient Air Temperature</span>
            <Thermometer size={18} color="#f1c680" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {rems?.air_temp_c ?? -28}°C
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>(-18.4°F)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cfb5ae' }}>
            Measured at 1.5m Mast Sensor
          </div>
        </div>

        {/* Ground Regolith Temp */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Ground Surface Temp</span>
            <Thermometer size={18} color="#f4896b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {rems?.ground_temp_c ?? -42}°C
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>(-43.6°F)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cfb5ae' }}>
            Infrared Regolith Thermopile
          </div>
        </div>

        {/* Diurnal Range */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Diurnal Cycle Range</span>
            <Sun size={18} color="#c0c8a1" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '24px',
              fontWeight: 700,
              color: '#c0c8a1'
            }}>
              {rems?.diurnal_min_c ?? -84}°C
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>to</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '24px',
              fontWeight: 700,
              color: '#f4896b'
            }}>
              +{rems?.diurnal_max_c ?? 4}°C
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#cfb5ae' }}>
            Peak midday warmth at 14:00 LMST
          </div>
        </div>
      </div>

      {/* Atmospheric Environment Subsystems */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Gale Atmospheric Constituents */}
        <div style={{
          backgroundColor: '#1b1213',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '1px',
            color: '#ff9983',
            margin: '0 0 16px 0',
            textTransform: 'uppercase'
          }}>
            Martian Atmosphere Profile
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Carbon Dioxide (CO₂)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>95.32%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Nitrogen (N₂) / Argon (Ar)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>2.6% N₂ · 1.9% Ar</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Water Vapor (Relative Humidity)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#38bdf8' }}>{rems?.humidity_relative_percent ?? 4.5}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Optical Dust Depth (Tau)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>0.65 (Nominal visibility)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>UV Radiation Flux</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f1c680' }}>{rems?.uv_index ?? 'Moderate'}</span>
            </div>
          </div>
        </div>

        {/* Radiation Monitoring Station */}
        <div style={{
          backgroundColor: '#1b1213',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '1px',
            color: '#38bdf8',
            margin: '0 0 16px 0',
            textTransform: 'uppercase'
          }}>
            Curiosity RAD Sensor Readouts
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Galactic Cosmic Ray Rate</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{rad?.dose_rate_uSv_hour ?? 24.2} µSv/h</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Daily Dosage Equivalent</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{rad?.dose_rate_mSv_day ?? 0.58} mSv/day</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Permissible EVA Duration</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>{rad?.cumulative_eva_allowed_hours ?? 8.0} hrs nominal</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Solar Particle Event Monitor</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>Normal (No active CME flare)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Spacesuit Shielding Rating</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#38bdf8' }}>NASA xEMU MLI Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Station Footnote */}
      <div style={{
        backgroundColor: '#241819',
        border: '1px solid #543337',
        borderRadius: '8px',
        padding: '16px 20px',
        fontSize: '12px',
        color: '#cfb5ae',
        lineHeight: 1.6
      }}>
        <strong style={{ color: '#ff9983' }}>Data Attribution:</strong> In-situ Martian atmospheric and weather data supplied by NASA Planetary Data System (PDS), Mars Science Laboratory (MSL) Curiosity REMS instrument (Centro de Astrobiología, Spain), and RAD detector (Southwest Research Institute, USA).
      </div>
    </div>
  );
};
