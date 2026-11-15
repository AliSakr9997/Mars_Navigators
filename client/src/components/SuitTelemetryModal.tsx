import React from 'react';
import { X, Heart, Wind, Gauge, Thermometer, ShieldAlert, Zap, Radiation } from 'lucide-react';
import { TelemetryResponse } from '../types/api';

interface SuitTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryResponse | null;
  evaTimeHours?: number;
}

export const SuitTelemetryModal: React.FC<SuitTelemetryModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  evaTimeHours = 2.1
}) => {
  if (!isOpen) return null;

  const rems = telemetry?.rems;
  const rad = telemetry?.rad;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#13151b',
        border: '1px solid #2a2e39',
        borderRadius: '12px',
        maxWidth: '720px',
        width: '100%',
        boxShadow: '0 16px 50px rgba(0,0,0,0.85)',
        color: '#f3f4f6',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #222630',
          backgroundColor: '#0f1116'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px' }}>
              ASTRONAUT SUIT TELEMETRY // BIOSENSORS & LIFE SUPPORT
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Top Status Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#0c0d12',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #1f232d'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>SUIT PRESSURE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f3f4f6', fontFamily: 'monospace', marginTop: '2px' }}>
                29.6 <span style={{ fontSize: '11px', color: '#9ca3af' }}>kPa</span>
              </div>
              <div style={{ fontSize: '10px', color: '#10b981' }}>NOMINAL 100% O₂</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>O₂ CONSUMPTION</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                0.82 <span style={{ fontSize: '11px', color: '#9ca3af' }}>L/min</span>
              </div>
              <div style={{ fontSize: '10px', color: '#38bdf8' }}>94% RESIDUAL</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>HEART RATE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f97316', fontFamily: 'monospace', marginTop: '2px' }}>
                78 <span style={{ fontSize: '11px', color: '#9ca3af' }}>BPM</span>
              </div>
              <div style={{ fontSize: '10px', color: '#f97316' }}>MODERATE EFFORT</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px' }}>CORE BODY TEMP</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                36.8 <span style={{ fontSize: '11px', color: '#9ca3af' }}>°C</span>
              </div>
              <div style={{ fontSize: '10px', color: '#10b981' }}>THERMAL STABLE</div>
            </div>
          </div>

          {/* Environmental Radiation & Thermal Conditions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Radiation Box */}
            <div style={{
              backgroundColor: '#0c0d12',
              borderRadius: '8px',
              border: '1px solid #1f232d',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#10b981' }}>
                <Radiation size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  RADIATION ASSESSMENT (CURIOSITY RAD)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Ambient Surface Dose:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{rad?.dose_rate_mSv_day || 0.67} mSv/day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Hourly Rate:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>27.9 µSv/h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Solar Particle Event:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>QUIET (NO SPE)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Permissible EVA Window:</span>
                  <span style={{ color: '#f97316', fontWeight: 700, fontFamily: 'monospace' }}>8.5 HOURS</span>
                </div>
              </div>
            </div>

            {/* Ambient Thermal & REMS Atmosphere Box */}
            <div style={{
              backgroundColor: '#0c0d12',
              borderRadius: '8px',
              border: '1px solid #1f232d',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#38bdf8' }}>
                <Thermometer size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  AMBIENT MARTIAN ENVIRONMENT (REMS)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Ground Surface Temp:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{rems?.ground_temp_c || 2.1} °C</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Ambient Air Temp:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{rems?.air_temp_c || -18.4} °C</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>Atmospheric Pressure:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{rems?.pressure_pa || 828.5} Pa</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span style={{ color: '#9ca3af' }}>UV Sensor Index:</span>
                  <span style={{ color: '#f97316', fontWeight: 700 }}>HIGH (UV-C SHIELD ENGAGED)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#e06c3a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 24px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                cursor: 'pointer'
              }}
            >
              CLOSE CONSOLE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
